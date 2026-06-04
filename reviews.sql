--
-- PostgreSQL database dump
--

\restrict NxhhyovSdRHslO8TpcoAIeDLoJeYol8heHeDoQIrGfdV9lT4RDIR4Y42ZqSKmfj

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

ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_user_id_fkey;
ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
ALTER TABLE public.reviews ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.reviews_id_seq;
DROP TABLE public.reviews;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    course character varying(150),
    text text NOT NULL,
    rating integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, name, course, text, rating, status, created_at) FROM stdin;
1	4	Екатерина	Автомобиль с МКПП — категория «B»	Очень довольна автошколой.Преподаватель Инна Геннадьевна, очень интересно рассказывает теорию, все понятно, очень добрая и веселая) Инструктор Гриб Валерий, вождение с ним пролетело легко и позитивно, я начинала с нуля, он меня всему научил! Огромное спасибо вашей автошколе за замечательных преподавателей	5	published	2026-05-09 10:22:19.174602
4	2	Александр	Мотоцикл — категория «A»	Отличный учебный центр. Благодарю своего инструктора, Евгения Александровича, за грамотное обучение. Решил продолжить курс после 5-ти летнего перерыва, Евгений помог вникнуть в процесс. вспомнить и закрепить навыки вождения и успешно сдать экзамены. Рекомендую.	5	published	2026-05-09 10:50:21.065134
2	5	Павел	Трактор — категории «B», «C», «E», «D»	Привет, учился в на Комарова 114, на теории было не скучно, рассказывали все в подробностях. Мой инструктор - Могилевский Сергей Аркадьевич, классный мужик! Научил ездить, в гаи с первого раза сдал. Всем рекомендую!	5	published	2026-05-09 10:42:35.515664
5	2	Александр	Автомобиль с МКПП — категория «B»	Здравствуйте. Учился в автошколе Лидер по адресу проспект Победы 384, хочу выразить огромную благодарность инструктору по вождению Сокольникову Дмитрию Викторовичу за его труд и терпение. Очень хороший преподаватель, всем рекомендую обучаться у него! Научит и Вас правильно водить автомобиль!	4	published	2026-05-10 23:37:13.100466
3	1	Наталья	Автомобиль с МКПП — категория «B»	Училась в автошколе, теорию учила самостоятельно дистанционно - материал был дан понятный и качественный, легко и быстро изучила. Практику проходила с инструктором Сергеем Юрьевичем. Спасибо ему огромное за терпение, ценные знания и поддержку, хороший инструктор!	5	published	2026-05-09 10:44:22.49651
9	4	Екатерина	Автомобиль с АКПП — категория «B» автомат	Отличная автошкола	5	pending	2026-05-13 08:46:56.026739
\.


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 10, true);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict NxhhyovSdRHslO8TpcoAIeDLoJeYol8heHeDoQIrGfdV9lT4RDIR4Y42ZqSKmfj

