-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Category (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'expense'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  organizationId text NOT NULL,
  userId text NOT NULL,
  CONSTRAINT Category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Item (
  id text NOT NULL,
  name text NOT NULL,
  itemPrice double precision NOT NULL,
  quantity integer NOT NULL,
  totalPrice double precision NOT NULL,
  organizationId text NOT NULL,
  userId text NOT NULL,
  masterItemId text,
  transactionId integer NOT NULL,
  CONSTRAINT Item_pkey PRIMARY KEY (id),
  CONSTRAINT Item_transactionId_fkey FOREIGN KEY (transactionId) REFERENCES public.Transaction(id),
  CONSTRAINT Item_masterItemId_fkey FOREIGN KEY (masterItemId) REFERENCES public.MasterItem(id)
);
CREATE TABLE public.MasterItem (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  defaultPrice double precision NOT NULL,
  type text NOT NULL DEFAULT 'expense'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  organizationId text NOT NULL,
  userId text NOT NULL,
  CONSTRAINT MasterItem_pkey PRIMARY KEY (id)
);
CREATE TABLE public.RelatedParty (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  contactInfo text,
  type text NOT NULL DEFAULT 'expense'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  organizationId text NOT NULL,
  userId text NOT NULL,
  CONSTRAINT RelatedParty_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Transaction (
  id integer NOT NULL DEFAULT nextval('"Transaction_id_seq"'::regclass),
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  date timestamp without time zone NOT NULL,
  description text NOT NULL,
  amountTotal double precision NOT NULL,
  paymentImg text NOT NULL DEFAULT ''::text,
  type text NOT NULL DEFAULT 'pengeluaran'::text,
  organizationId text NOT NULL,
  userId text NOT NULL,
  categoryId text NOT NULL,
  relatedPartyId text NOT NULL,
  CONSTRAINT Transaction_pkey PRIMARY KEY (id),
  CONSTRAINT Transaction_relatedPartyId_fkey FOREIGN KEY (relatedPartyId) REFERENCES public.RelatedParty(id),
  CONSTRAINT Transaction_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES public.Category(id)
);
