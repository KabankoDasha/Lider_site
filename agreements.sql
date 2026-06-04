--
-- PostgreSQL database dump
--

\restrict T0ywUT5whr3CsckfZSWfkQSs07fVFtJ3gehNUVpGn31VMXgR6QMXOARTniBVpKp

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

ALTER TABLE ONLY public.agreements DROP CONSTRAINT agreements_user_id_fkey;
ALTER TABLE ONLY public.agreements DROP CONSTRAINT agreements_pkey;
ALTER TABLE public.agreements ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.agreements_id_seq;
DROP TABLE public.agreements;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreements (
    id integer NOT NULL,
    user_id integer,
    course character varying(255) DEFAULT 'Автомобиль с МКПП — категория «B»'::character varying,
    full_name character varying(255),
    birth_date character varying(50),
    birth_place character varying(255),
    passport_series character varying(20),
    passport_number character varying(20),
    passport_issued_by text,
    passport_issued_date character varying(50),
    registration_address text,
    phone character varying(30),
    workplace character varying(255),
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agreements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agreements_id_seq OWNED BY public.agreements.id;


--
-- Name: agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements ALTER COLUMN id SET DEFAULT nextval('public.agreements_id_seq'::regclass);


--
-- Data for Name: agreements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agreements (id, user_id, course, full_name, birth_date, birth_place, passport_series, passport_number, passport_issued_by, passport_issued_date, registration_address, phone, workplace, status, created_at) FROM stdin;
11	1	Автомобиль с МКПП — категория «B»	Васильев Алексей Иванович	12.11.1997	г. Челябинск	4518	105632	Отделом УФМС по г. Челябинску, Челябинская область	01.01.2017	г. Челябинск, ул. Металлургов. д. 15	89512351516	ООО "Атлант"	submitted	2026-05-12 21:50:46.397331
10	2	Автомобиль с МКПП — категория «B»	Васильев Алексей Иванович	12.11.1997	г. Челябинск	4518	105632	Отделом УФМС по г. Челябинску, Челябинская область	01.01.2017	г. Челябинск, ул. Металлургов. д. 15	89512351516	ООО "Атлант"	submitted	2026-05-10 20:21:17.25199
\.


--
-- Name: agreements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agreements_id_seq', 11, true);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: agreements agreements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict T0ywUT5whr3CsckfZSWfkQSs07fVFtJ3gehNUVpGn31VMXgR6QMXOARTniBVpKp

