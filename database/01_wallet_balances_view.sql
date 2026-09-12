CREATE OR REPLACE VIEW wallet_balances AS
SELECT 
  w.id as wallet_id,
  w.opening_balance + COALESCE(SUM(
    CASE 
      WHEN t.direction = 'IN' THEN t.amount 
      WHEN t.direction = 'OUT' THEN -t.amount 
      ELSE 0 
    END
  ), 0) as expected_balance
FROM wallets w
LEFT JOIN transactions t ON t.wallet_id = w.id AND t.status = 'active'
GROUP BY w.id, w.opening_balance;
