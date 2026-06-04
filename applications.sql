--
-- PostgreSQL database dump
--

\restrict owaQMreOIv3UdyFXbPph1KrO9fxjf9ZGkAtAU9ium2ScLI0zhRDIazaTlseYVuL

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

ALTER TABLE ONLY public.applications DROP CONSTRAINT applications_user_id_fkey;
ALTER TABLE ONLY public.applications DROP CONSTRAINT applications_pkey;
ALTER TABLE public.applications ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.applications_id_seq;
DROP TABLE public.applications;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    course character varying(150),
    comment text,
    status character varying(20) DEFAULT 'processing'::character varying,
    user_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, name, phone, course, comment, status, user_id, created_at) FROM stdin;
1	Наталья	89223071515	Автомобиль с МКПП — категория «B»	Хочу записаться на дистанционное обучение, подскажите, когда смогу приступить к занятиям?	confirmed	1	2026-05-09 10:45:42.476922
2	Александр	86554321097	Мотоцикл — категория «A»	Здравствуйте, есть ли дистанционное обучение на категорию А? Как оно проходит?	rejected	2	2026-05-09 10:51:13.309728
3	Наталья	89223071515	Автомобиль с МКПП — категория «B»	Подскажите, как получить доступ к личному кабинету на Профтехе?	processing	1	2026-05-10 23:44:33.368969
4	Александр	86554321097	Погрузчик — категории «B», «C», «D»	Тестовая заявка	confirmed	2	2026-05-12 21:48:48.790748
6	Иван	89999999999	Мотоцикл — категория «A»		confirmed	\N	2026-05-13 08:41:02.178296
5	Иван	89999999999	Мотоцикл — категория «A»		processing	\N	2026-05-13 08:31:36.930622
7	Петр	89175332642	Автомобиль с МКПП — категория «B»		processing	\N	2026-05-28 20:51:33.025221
8	Мария	83124509912	Мотоцикл — категория «A»		processing	\N	2026-05-28 21:17:03.583642
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_id_seq', 9, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict owaQMreOIv3UdyFXbPph1KrO9fxjf9ZGkAtAU9ium2ScLI0zhRDIazaTlseYVuL

