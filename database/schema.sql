-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    normalized_name TEXT,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    contact_id UUID REFERENCES contacts(id),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),
    kind TEXT NOT NULL, -- 'REGULAR', 'BORROWED', 'REPAYMENT', 'TRANSFER', 'ADJUSTMENT'
    note TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    transfer_group_id UUID,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'void')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Obligations (Borrowed Money)
CREATE TABLE obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    origin_transaction_id UUID REFERENCES transactions(id),
    original_amount NUMERIC(14,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled', 'void')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Obligation Repayments
CREATE TABLE obligation_repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obligation_id UUID NOT NULL REFERENCES obligations(id),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reconciliations
CREATE TABLE reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    expected_balance NUMERIC(14,2) NOT NULL,
    observed_balance NUMERIC(14,2) NOT NULL,
    difference NUMERIC(14,2) NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id, occurred_at DESC);
CREATE INDEX idx_transactions_contact ON transactions(contact_id, occurred_at DESC);
CREATE INDEX idx_contacts_normalized_name ON contacts(normalized_name);
CREATE INDEX idx_contacts_last_used ON contacts(last_used_at DESC);
CREATE INDEX idx_obligations_status ON obligations(status);
CREATE INDEX idx_reconciliations_wallet ON reconciliations(wallet_id, checked_at DESC);

-- Seed Data (Default Wallets)
INSERT INTO wallets (name, slug, sort_order) VALUES
    ('Maya', 'maya', 1),
    ('GCash', 'gcash', 2),
    ('MariBank', 'maribank', 3),
    ('Auto-supply', 'auto-supply', 4),
    ('Load', 'load', 5)
ON CONFLICT (slug) DO NOTHING;
