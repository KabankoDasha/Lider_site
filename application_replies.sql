--
-- PostgreSQL database dump
--

\restrict I8aETYsdgtSjPGPkw0qEMEXPnF6HXjfQ13y4ZJdmPLSD0t27Av6lTFo1HW5zk4O

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

ALTER TABLE ONLY public.application_replies DROP CONSTRAINT application_replies_application_id_fkey;
ALTER TABLE ONLY public.application_replies DROP CONSTRAINT application_replies_admin_id_fkey;
ALTER TABLE ONLY public.application_replies DROP CONSTRAINT application_replies_pkey;
ALTER TABLE public.application_replies ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.application_replies_id_seq;
DROP TABLE public.application_replies;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: application_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_replies (
    id integer NOT NULL,
    application_id integer NOT NULL,
    admin_id integer,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: application_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_replies_id_seq OWNED BY public.application_replies.id;


--
-- Name: application_replies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_replies ALTER COLUMN id SET DEFAULT nextval('public.application_replies_id_seq'::regclass);


--
-- Data for Name: application_replies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.application_replies (id, application_id, admin_id, message, created_at) FROM stdin;
1	3	3	Тестовый ответ	2026-05-19 22:16:51.534746
\.


--
-- Name: application_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.application_replies_id_seq', 1, true);


--
-- Name: application_replies application_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_replies
    ADD CONSTRAINT application_replies_pkey PRIMARY KEY (id);


--
-- Name: application_replies application_replies_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_replies
    ADD CONSTRAINT application_replies_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: application_replies application_replies_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_replies
    ADD CONSTRAINT application_replies_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict I8aETYsdgtSjPGPkw0qEMEXPnF6HXjfQ13y4ZJdmPLSD0t27Av6lTFo1HW5zk4O

