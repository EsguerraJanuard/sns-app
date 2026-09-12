-- Enable RLS on all tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligation_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- (Requires actual Supabase JWT authentication via @supabase/ssr)

-- Wallets
CREATE POLICY "Enable read/write for authenticated users on wallets"
ON wallets FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Contacts
CREATE POLICY "Enable read/write for authenticated users on contacts"
ON contacts FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Transactions
CREATE POLICY "Enable read/write for authenticated users on transactions"
ON transactions FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Obligations
CREATE POLICY "Enable read/write for authenticated users on obligations"
ON obligations FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Obligation Repayments
CREATE POLICY "Enable read/write for authenticated users on obligation_repayments"
ON obligation_repayments FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Reconciliations
CREATE POLICY "Enable read/write for authenticated users on reconciliations"
ON reconciliations FOR ALL TO authenticated
USING (true) WITH CHECK (true);
