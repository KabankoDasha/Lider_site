--
-- PostgreSQL database dump
--

\restrict OmP5jfKlse2ocmg90UhRitfWvzPviSZI4z0ee7YPo8oVM9dSbH2uneBaqLdNPLS

-- Dumped from database version 18.3 (Postgres.app)
-- Dumped by pg_dump version 18.3 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.user_documents DROP CONSTRAINT user_documents_user_id_fkey;
ALTER TABLE ONLY public.user_documents DROP CONSTRAINT user_documents_pkey;
ALTER TABLE public.user_documents ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.user_documents_id_seq;
DROP TABLE public.user_documents;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_documents (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(20) NOT NULL,
    file_path character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_documents_type_check CHECK (((type)::text = ANY ((ARRAY['passport'::character varying, 'snils'::character varying, 'medical'::character varying])::text[])))
);


--
-- Name: user_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_documents_id_seq OWNED BY public.user_documents.id;


--
-- Name: user_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_documents ALTER COLUMN id SET DEFAULT nextval('public.user_documents_id_seq'::regclass);


--
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_documents (id, user_id, type, file_path, original_name, created_at) FROM stdin;
1	2	passport	/Users/Yara/Lider/backend/uploads/documents/file-1778442705831-986965393.jpg	17732992275114730.jpg	2026-05-10 22:51:45.898626
2	2	snils	/Users/Yara/Lider/backend/uploads/documents/file-1778442715847-872255105.jpg	 .jpg	2026-05-10 22:51:55.851038
3	2	medical	/Users/Yara/Lider/backend/uploads/documents/file-1778442723571-221887601.jpg	Ð²Ð°ÑÐ¸Ð°Ð½Ñ 1.jpg	2026-05-10 22:52:03.579302
\.


--
-- Name: user_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_documents_id_seq', 3, true);


--
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (id);


--
-- Name: user_documents user_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict OmP5jfKlse2ocmg90UhRitfWvzPviSZI4z0ee7YPo8oVM9dSbH2uneBaqLdNPLS

