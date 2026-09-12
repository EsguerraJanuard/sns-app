-- Supabase RPC for secure repayment with Row-Level Locking
CREATE OR REPLACE FUNCTION repay_obligation(
    p_contact_id UUID,
    p_wallet_id UUID,
    p_amount NUMERIC(14,2),
    p_note TEXT,
    p_is_lent BOOLEAN DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_owed NUMERIC(14,2);
    v_remaining_amount NUMERIC(14,2);
    v_tx_id UUID;
    v_ob RECORD;
    v_amount_to_apply NUMERIC(14,2);
    v_debt_type TEXT;
    v_direction TEXT;
BEGIN
    v_debt_type := CASE WHEN p_is_lent THEN 'LENT' ELSE 'BORROWED' END;
    v_direction := CASE WHEN p_is_lent THEN 'IN' ELSE 'OUT' END;

    -- 1. Lock the open obligations for this contact to prevent concurrent double-spend
    -- We sum the remaining owed amount
    SELECT COALESCE(SUM(o.original_amount - COALESCE(
        (SELECT SUM(amount) FROM obligation_repayments WHERE obligation_id = o.id), 0
    )), 0)
    INTO v_total_owed
    FROM obligations o
    JOIN transactions t ON o.origin_transaction_id = t.id
    WHERE o.contact_id = p_contact_id AND o.status = 'open' AND t.kind = v_debt_type
    FOR UPDATE OF o;

    IF v_total_owed = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No open debts found for this contact.');
    END IF;

    IF p_amount > v_total_owed THEN
        RETURN jsonb_build_object('success', false, 'error', 'Repayment amount exceeds total debt. Maximum allowed: ' || v_total_owed);
    END IF;

    -- 2. Insert the single REPAYMENT transaction
    INSERT INTO transactions (wallet_id, contact_id, amount, direction, kind, note)
    VALUES (p_wallet_id, p_contact_id, p_amount, v_direction, 'REPAYMENT', p_note)
    RETURNING id INTO v_tx_id;

    -- 3. Distribute the payment across open obligations (oldest first)
    v_remaining_amount := p_amount;

    FOR v_ob IN 
        SELECT o.id, (o.original_amount - COALESCE(
            (SELECT SUM(amount) FROM obligation_repayments WHERE obligation_id = o.id), 0
        )) as remaining_debt
        FROM obligations o
        JOIN transactions t ON o.origin_transaction_id = t.id
        WHERE o.contact_id = p_contact_id AND o.status = 'open' AND t.kind = v_debt_type
        ORDER BY o.opened_at ASC
        FOR UPDATE OF o
    LOOP
        IF v_remaining_amount <= 0 THEN
            EXIT;
        END IF;

        IF v_ob.remaining_debt <= v_remaining_amount THEN
            v_amount_to_apply := v_ob.remaining_debt;
            
            -- Fully paid this obligation
            UPDATE obligations 
            SET status = 'settled', settled_at = now() 
            WHERE id = v_ob.id;
        ELSE
            v_amount_to_apply := v_remaining_amount;
        END IF;

        INSERT INTO obligation_repayments (obligation_id, transaction_id, amount)
        VALUES (v_ob.id, v_tx_id, v_amount_to_apply);

        v_remaining_amount := v_remaining_amount - v_amount_to_apply;
    END LOOP;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    -- Postgres will automatically rollback the transaction if any error occurs
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
