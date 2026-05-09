require('dotenv').config();
const pool = require('./db');

const courses = [
  { name: 'Автомобиль с МКПП — категория «B»', duration: '2,5 месяца', distancePrice: '46 700', distanceOld: '48 700', fulltimePrice: '49 700', fulltimeOld: '51 700' },
  { name: 'Автомобиль с АКПП — категория «B» автомат', duration: '2,5 месяца', distancePrice: '50 300', distanceOld: '53 300', fulltimePrice: '53 700', fulltimeOld: '55 700' },
  { name: 'Мотоцикл — категория «A»', duration: '2,5 месяца', distancePrice: '25 000', distanceOld: '', fulltimePrice: '25 000', fulltimeOld: '' },
  { name: 'Погрузчик — категории «B», «C», «D»', duration: '1,5 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Экскаватор — категории «C», «E», «D»', duration: '2 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Трактор — категории «B», «C», «E», «D»', duration: '1 месяц', distancePrice: '25 000', distanceOld: '35 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Бульдозер — категория «E» с 19 лет', duration: '2 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Автогрейдер — категории «C», «D» с 19 лет', duration: '2 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Автомобильный кран', duration: '2 месяца', distancePrice: '18 000', distanceOld: '', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Мостовой кран', duration: '2 месяца', distancePrice: '18 000', distanceOld: '', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Автовышка и автогидроподъемник', duration: '2,5 месяца', distancePrice: '18 000', distanceOld: '', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Квадроцикл и снегоход — категория «AI» с 16 лет', duration: '1,5 месяца', distancePrice: '16 000', distanceOld: '', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Внедорожные автотранспортные средства — категория «AII» с 19 лет', duration: '1,5 месяца', distancePrice: 'от 18 000', distanceOld: '', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Внедорожные автотранспортные средства — категория «АIII» (БелАЗ)', duration: '1,5 месяца', distancePrice: '35 000', distanceOld: '', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Машинист катка — категория «C»', duration: '2 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Машинист уплотняющей машины «Ратрак» — категория «E»', duration: '2 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
  { name: 'Машинист крана на самоходном ходу', duration: '2,5 месяца', distancePrice: '15 000', distanceOld: '25 000', fulltimePrice: '', fulltimeOld: '' },
];

const sales = [
  { name: 'Акция на автокурсы категории «B»', discount: '-10%', validity: 'до 31.03.2026' },
  { name: 'Акция 1+1 на обучение автомобиль+мотоцикл', discount: '-15%', validity: 'до 31.03.2026' },
  { name: 'Акция на курсы водителя квадроцикла', discount: '-50%', validity: 'до 15.04.2026' },
  { name: 'Скидка на обучение на спецтехнику', discount: '-20%', validity: 'до 30.06.2026' },
  { name: 'Раннее бронирование', discount: '-15%', validity: 'до 31.05.2026' },
  { name: 'Семейная скидка', discount: '-10%', validity: 'при обучении двух членов семьи' },
];

const instructors = [
  { name: 'Ушакова Инна Геннадьевна', experience: '12 лет', car: '', education: 'Высшее', rating: 4.7, category: 'Преподаватель по теории', photo: 'prep3.svg' },
  { name: 'Алифиренко Александр Николаевич', experience: '20 лет', car: '', education: 'Высшее', rating: 4.7, category: 'Преподаватель по теории', photo: 'prep1.svg' },
  { name: 'Симакин Данил Владимирович', experience: '17 лет', car: '', education: 'Высшее', rating: 4.8, category: 'Преподаватель по теории', photo: 'prep2.svg' },
  { name: 'Кокшаров Игорь Викторович', experience: '15 лет', car: '', education: 'Высшее', rating: 4.9, category: 'Преподаватель по теории', photo: 'prep4.svg' },
  { name: 'Котляренко Людмила Васильевна', experience: '14 лет', car: '', education: 'Высшее', rating: 4.6, category: 'Преподаватель по теории', photo: 'prep5.svg' },
  { name: 'Мещеряков Александр Александрович', experience: '11 лет', car: '', education: 'Высшее', rating: 4.8, category: 'Преподаватель по теории', photo: 'prep6.svg' },
  { name: 'Устюгов Виктор Владимирович', experience: '13 лет', car: '', education: 'Высшее', rating: 4.5, category: 'Преподаватель по теории', photo: 'prep7.svg' },
  { name: 'Ярушин Алексей Константинович', experience: '10 лет', car: 'Hyundai Accent', education: '', rating: 4.8, category: 'Инструктор по вождению', photo: 'instr1.svg' },
  { name: 'Бубенко Елена Валерьевна', experience: '14 лет', car: 'Hyundai Solaris', education: '', rating: 4.6, category: 'Инструктор по вождению', photo: 'instr2.svg' },
  { name: 'Ярушин Иван Константинович', experience: '11 лет', car: 'Changan Alsvin', education: '', rating: 4.7, category: 'Инструктор по вождению', photo: 'instr3.svg' },
  { name: 'Гаев Александр Геннадьевич', experience: '7 лет', car: 'Renault Logan', education: '', rating: 4.5, category: 'Инструктор по вождению', photo: 'instr4.svg' },
  { name: 'Махоня Ольга Валентиновна', experience: '27 лет', car: 'Lada Vesta', education: '', rating: 4.2, category: 'Инструктор по вождению', photo: 'instr5.svg' },
  { name: 'Гриб Валерий Анатольевич', experience: '20 лет', car: 'Renault Kaptur', education: '', rating: 4.0, category: 'Инструктор по вождению', photo: 'instr6.svg' },
  { name: 'Могилевский Сергей Аркадьевич', experience: '19 лет', car: 'Chevrolet Lacetti', education: '', rating: 3.2, category: 'Инструктор по вождению', photo: 'instr7.svg' },
  { name: 'Сокольников Дмитрий Викторович', experience: '19 лет', car: 'Hyundai Accent', education: '', rating: 3.7, category: 'Инструктор по вождению', photo: 'instr8.svg' },
  { name: 'Махотина Ксения Олеговна', experience: '6 лет', car: 'Lada Vesta', education: '', rating: 5.0, category: 'Инструктор по вождению', photo: 'instr9.svg' },
  { name: 'Чувильков Денис Алексеевич', experience: '10 лет', car: 'Hyundai Accent', education: '', rating: 4.6, category: 'Инструктор по вождению', photo: 'instr10.svg' },
  { name: 'Юсупова Юлия Суфьяновна', experience: '7 лет', car: 'Changan Alsvin', education: '', rating: 4.3, category: 'Инструктор по вождению', photo: 'instr11.svg' },
];

(async () => {
  try {
    // Очистка таблиц (осторожно: удалит все данные!)
    await pool.query('DELETE FROM courses');
    await pool.query("ALTER SEQUENCE courses_id_seq RESTART WITH 1");

    await pool.query('DELETE FROM sales');
    await pool.query("ALTER SEQUENCE sales_id_seq RESTART WITH 1");

    await pool.query('DELETE FROM instructors');
    await pool.query("ALTER SEQUENCE instructors_id_seq RESTART WITH 1");

    // Вставка курсов
    for (const c of courses) {
      await pool.query(
        `INSERT INTO courses (name, duration, distance_price, distance_old_price, fulltime_price, fulltime_old_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.name, c.duration, c.distancePrice, c.distanceOld, c.fulltimePrice, c.fulltimeOld]
      );
    }
    console.log('Курсы добавлены');

    // Вставка акций
    for (const s of sales) {
      await pool.query(
        `INSERT INTO sales (name, discount, validity) VALUES ($1, $2, $3)`,
        [s.name, s.discount, s.validity]
      );
    }
    console.log('Акции добавлены');

    // Вставка инструкторов
    for (const i of instructors) {
       await pool.query(
         `INSERT INTO instructors (name, experience, car, education, rating, category, photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
         [i.name, i.experience, i.car, i.education, i.rating, i.category, i.photo]
       );
    }
    console.log('Инструкторы добавлены');

    console.log('Начальные данные успешно загружены!');
  } catch (err) {
    console.error('Ошибка при заполнении базы:', err);
  } finally {
    pool.end();
  }
})();