--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: increment_revision_count_on_update(); Type: FUNCTION; Schema: public; Owner: ftml
--

CREATE FUNCTION public.increment_revision_count_on_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW."revisionCount" := OLD."revisionCount" + 1;
      NEW."updatedAt" := CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$;


ALTER FUNCTION public.increment_revision_count_on_update() OWNER TO ftml;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: indexdata; Type: TABLE; Schema: public; Owner: ftml
--

CREATE TABLE public.indexdata (
    id integer NOT NULL,
    "shortId" text NOT NULL,
    title text,
    source text,
    "hashedPassword" text,
    "revisionCount" integer DEFAULT 0,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" text,
    "wikidotPageId" text,
    "wikidotSiteId" text,
    "wikidotLastSync" timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.indexdata OWNER TO ftml;

--
-- Name: indexdata_id_seq; Type: SEQUENCE; Schema: public; Owner: ftml
--

CREATE SEQUENCE public.indexdata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.indexdata_id_seq OWNER TO ftml;

--
-- Name: indexdata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ftml
--

ALTER SEQUENCE public.indexdata_id_seq OWNED BY public.indexdata.id;


--
-- Name: kysely_migration; Type: TABLE; Schema: public; Owner: ftml
--

CREATE TABLE public.kysely_migration (
    name character varying(255) NOT NULL,
    "timestamp" character varying(255) NOT NULL
);


ALTER TABLE public.kysely_migration OWNER TO ftml;

--
-- Name: kysely_migration_lock; Type: TABLE; Schema: public; Owner: ftml
--

CREATE TABLE public.kysely_migration_lock (
    id character varying(255) NOT NULL,
    is_locked integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.kysely_migration_lock OWNER TO ftml;

--
-- Name: revisiondata; Type: TABLE; Schema: public; Owner: ftml
--

CREATE TABLE public.revisiondata (
    id integer NOT NULL,
    "shortId" text NOT NULL,
    title text,
    source text,
    "hashedPassword" text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "createdBy" text,
    "revisionCount" integer DEFAULT 0,
    "wikidotRevisionId" text
);


ALTER TABLE public.revisiondata OWNER TO ftml;

--
-- Name: revisiondata_id_seq; Type: SEQUENCE; Schema: public; Owner: ftml
--

CREATE SEQUENCE public.revisiondata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revisiondata_id_seq OWNER TO ftml;

--
-- Name: revisiondata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ftml
--

ALTER SEQUENCE public.revisiondata_id_seq OWNED BY public.revisiondata.id;


--
-- Name: wikidot_sync_log; Type: TABLE; Schema: public; Owner: ftml
--

CREATE TABLE public.wikidot_sync_log (
    id integer NOT NULL,
    "shortId" text NOT NULL,
    "wikidotPageId" text,
    sync_type text NOT NULL,
    sync_status text NOT NULL,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT wikidot_sync_log_sync_status_check CHECK ((sync_status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text]))),
    CONSTRAINT wikidot_sync_log_sync_type_check CHECK ((sync_type = ANY (ARRAY['import'::text, 'export'::text, 'sync'::text])))
);


ALTER TABLE public.wikidot_sync_log OWNER TO ftml;

--
-- Name: wikidot_sync_log_id_seq; Type: SEQUENCE; Schema: public; Owner: ftml
--

CREATE SEQUENCE public.wikidot_sync_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wikidot_sync_log_id_seq OWNER TO ftml;

--
-- Name: wikidot_sync_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ftml
--

ALTER SEQUENCE public.wikidot_sync_log_id_seq OWNED BY public.wikidot_sync_log.id;


--
-- Name: indexdata id; Type: DEFAULT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.indexdata ALTER COLUMN id SET DEFAULT nextval('public.indexdata_id_seq'::regclass);


--
-- Name: revisiondata id; Type: DEFAULT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.revisiondata ALTER COLUMN id SET DEFAULT nextval('public.revisiondata_id_seq'::regclass);


--
-- Name: wikidot_sync_log id; Type: DEFAULT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.wikidot_sync_log ALTER COLUMN id SET DEFAULT nextval('public.wikidot_sync_log_id_seq'::regclass);


--
-- Data for Name: indexdata; Type: TABLE DATA; Schema: public; Owner: ftml
--

COPY public.indexdata (id, "shortId", title, source, "hashedPassword", "revisionCount", "updatedAt", "updatedBy", "wikidotPageId", "wikidotSiteId", "wikidotLastSync", metadata) FROM stdin;
1	xEE6mqERbg	tes	test	\N	0	2025-06-21 05:22:52.132+00	uiiXQPeWHU	\N	\N	\N	{}
\.


--
-- Data for Name: kysely_migration; Type: TABLE DATA; Schema: public; Owner: ftml
--

COPY public.kysely_migration (name, "timestamp") FROM stdin;
001_initial_schema	2025-06-21T05:17:02.693Z
002_future_features	2025-06-21T05:17:02.711Z
\.


--
-- Data for Name: kysely_migration_lock; Type: TABLE DATA; Schema: public; Owner: ftml
--

COPY public.kysely_migration_lock (id, is_locked) FROM stdin;
migration_lock	0
\.


--
-- Data for Name: revisiondata; Type: TABLE DATA; Schema: public; Owner: ftml
--

COPY public.revisiondata (id, "shortId", title, source, "hashedPassword", "createdAt", "createdBy", "revisionCount", "wikidotRevisionId") FROM stdin;
1	xEE6mqERbg	tes	test	\N	2025-06-21 05:22:52.14+00	uiiXQPeWHU	0	\N
\.


--
-- Data for Name: wikidot_sync_log; Type: TABLE DATA; Schema: public; Owner: ftml
--

COPY public.wikidot_sync_log (id, "shortId", "wikidotPageId", sync_type, sync_status, error_message, metadata, created_at) FROM stdin;
\.


--
-- Name: indexdata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ftml
--

SELECT pg_catalog.setval('public.indexdata_id_seq', 1, true);


--
-- Name: revisiondata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ftml
--

SELECT pg_catalog.setval('public.revisiondata_id_seq', 1, true);


--
-- Name: wikidot_sync_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ftml
--

SELECT pg_catalog.setval('public.wikidot_sync_log_id_seq', 1, false);


--
-- Name: indexdata indexdata_pkey; Type: CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.indexdata
    ADD CONSTRAINT indexdata_pkey PRIMARY KEY (id);


--
-- Name: indexdata indexdata_shortId_key; Type: CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.indexdata
    ADD CONSTRAINT "indexdata_shortId_key" UNIQUE ("shortId");


--
-- Name: kysely_migration_lock kysely_migration_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.kysely_migration_lock
    ADD CONSTRAINT kysely_migration_lock_pkey PRIMARY KEY (id);


--
-- Name: kysely_migration kysely_migration_pkey; Type: CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.kysely_migration
    ADD CONSTRAINT kysely_migration_pkey PRIMARY KEY (name);


--
-- Name: revisiondata revisiondata_pkey; Type: CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.revisiondata
    ADD CONSTRAINT revisiondata_pkey PRIMARY KEY (id);


--
-- Name: wikidot_sync_log wikidot_sync_log_pkey; Type: CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.wikidot_sync_log
    ADD CONSTRAINT wikidot_sync_log_pkey PRIMARY KEY (id);


--
-- Name: idx_indexdata_shortid; Type: INDEX; Schema: public; Owner: ftml
--

CREATE INDEX idx_indexdata_shortid ON public.indexdata USING btree ("shortId");


--
-- Name: idx_indexdata_wikidot; Type: INDEX; Schema: public; Owner: ftml
--

CREATE INDEX idx_indexdata_wikidot ON public.indexdata USING btree ("wikidotPageId", "wikidotSiteId");


--
-- Name: idx_revisiondata_created_at; Type: INDEX; Schema: public; Owner: ftml
--

CREATE INDEX idx_revisiondata_created_at ON public.revisiondata USING btree ("createdAt");


--
-- Name: idx_revisiondata_shortid; Type: INDEX; Schema: public; Owner: ftml
--

CREATE INDEX idx_revisiondata_shortid ON public.revisiondata USING btree ("shortId");


--
-- Name: idx_wikidot_sync_log_created; Type: INDEX; Schema: public; Owner: ftml
--

CREATE INDEX idx_wikidot_sync_log_created ON public.wikidot_sync_log USING btree (created_at);


--
-- Name: idx_wikidot_sync_log_shortid; Type: INDEX; Schema: public; Owner: ftml
--

CREATE INDEX idx_wikidot_sync_log_shortid ON public.wikidot_sync_log USING btree ("shortId");


--
-- Name: indexdata update_revision_count; Type: TRIGGER; Schema: public; Owner: ftml
--

CREATE TRIGGER update_revision_count BEFORE UPDATE ON public.indexdata FOR EACH ROW WHEN (((old.source IS DISTINCT FROM new.source) OR (old.title IS DISTINCT FROM new.title))) EXECUTE FUNCTION public.increment_revision_count_on_update();


--
-- Name: revisiondata fk_revisiondata_shortid; Type: FK CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.revisiondata
    ADD CONSTRAINT fk_revisiondata_shortid FOREIGN KEY ("shortId") REFERENCES public.indexdata("shortId");


--
-- Name: wikidot_sync_log fk_wikidot_sync_shortid; Type: FK CONSTRAINT; Schema: public; Owner: ftml
--

ALTER TABLE ONLY public.wikidot_sync_log
    ADD CONSTRAINT fk_wikidot_sync_shortid FOREIGN KEY ("shortId") REFERENCES public.indexdata("shortId");


--
-- PostgreSQL database dump complete
--

