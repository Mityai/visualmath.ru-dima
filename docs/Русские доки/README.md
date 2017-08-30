Файлы по соседству (английские) тоже можно почитать, хотя и много полезной информации я там не нашел.

Для начала, запуск проекта.

Базируется на этом теплейте: https://github.com/erikras/react-redux-universal-hot-example

**ПЕРЕД ЗАПУСКОМ ТЕСТОВ ИЛИ САМОГО ПРОЕКТА НЕ ЗАБЫТЬ ВЫПОЛНИТЬ КОМАНДУ `mongod`**

mongo можно скачать с сайта: https://www.mongodb.com

Перед первым запуском нужно добавить админа в проект:
```
mongo #откроет консоль монги
use visualmath # переключить дб на нашу
db.users.insert({ "_id" : ObjectId("56d985a4c73e305982b70144"), "username" : "admin", "hashedPassword" : "8d5080d1af981610e52a273567bf792b778eee9e8c2a2d2997932c8aafe859fb", "role" : "admin", "created" : ISODate("2016-03-04T12:55:00.391Z"), "__v" : 0, "lectureSubscriptions" : [ ] }) # добавит пользователя с логином admin и паролем admin
```

После монги можно запускать проект.

```
npm i
npm run dev
```

Теперь можно открыть на `localhost:3000`

**О структуре**

Основная разработка идет в папках `api` и `src`. Первая отвечает за бекенд, вторая отвечает за фронтенд.
Архитектура трехслойная. Самый задний слой - `api`. Средний слой - nodejs. Передний - react. 

react в проекте isomorphic/universal, то есть при первом обращении к сайту начальный рендеринг HTML происходит
на сервере. Весь (или почти весь) код в папке `src` может быть и исполняется как на сервере, то и на клиенте.
Об этом нужно помнить особенно в тех ситуациях, когда нужно работать с внешними библиотеками (в частности, графар и скелетон).
Самая частая ошибка - обращение к объекту `window` или к его полям. На сервере такого объекта нет. 
Кроме того, react ожидает, что рендеринг на сервере будет давать такой же результат, что и на клиенте.
Поэтому прямого влияния объектов из `window` и внешних библиотек, которые не могут исполняться не сервере, надо избегать.
Есть два пути. Проверять, что значение глобальной переменной `__CLIENT__ === true`. Либо проверять существование объекта
`window`. 

Примеры:

`src/components/AvailableModules/AvailableModules.js`

`src/components/Module/Module.js`

**redux**

Redux - это маленькая библиотека, но гораздо больше - паттерн проектирования. Написана Дэном Абрамовым, парнем из России. Вдохновился он де-факто стандартной архитектурой приложений на функциональном языке elm. elm компилируется в html и js. Сам elm вдохновлен по большей части haskell и некоторым другими технологиями. 

Теперь к сути. redux - это, в некотором роде, переосмысленный flux. 
Вместо store`ов для каждого логически отдельного куска данных есть единственный store, который, в идеале, хранит абсолютно полное состояние приложения. На этом store заканчиваются (опять же, в идеале) все переменные в приложении. 

Не стоит понимать это совсем буквально. Все еще появляются переменные, которые отвечают за модули из require/import. Все еще есть временные переменные. Но сами компоненты свое состояние никогда или почти никогда не хранят. На практике все довольно близко к этой идее.

У store есть два основных метода: `subscribe` и `dispatch`. Грубо, `subscribe` принимает функцию, которая вызывается каждый раз, когда меняется состояние хранилища. Функция `dispatch` передает какое-то событие в хранилище. Событие - это объект.

Сами по себе события не меняют ничего. Когда они через `dispatch` сообщаются хранилищу, то они дальше попадают в reducer. Редьюсер - это чистая функция, которая принимает текущее состояние хранилища, событие и возвращает следующее состояние хранилища. Чистая функция значит, что нет никаких сайд эффектов и что вывод функции зависит исключительно от переданных аргументов, а не от глобальных переменных или чего-то другого. Отсутствие сайд эффектов - функция ничего не меняет. Не переданное состояние, ни событие, ни любые другие переменные. Когда редьюсер возвращает новое состояние, то он действительно возвращает новый объект. В типичном сценарии большая часть свойств объекта предыдущего состояния копируется в объект следующего состояния. 

**Рабочий поток**

Есть всего несколько сущностей, которые создаются для каждого компонента/страницы. 

Страницы хранятся в папке `containers`. Стоит обратить внимание на файл `containers/index.js`, где нужно не забыть добавить свой контейнер при его создании.

Рассмотрим, например, `ModulesList`, который показывает список всех доступных модулей. На момент написания этих строк речь идет о коммите `b410752265f4677e5c741acb77168601f2ee14ab`. Для удобства, полный листинг: 

```
import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import {connect} from 'react-redux'
import Helmet from 'react-helmet'
import moment from 'moment'
moment.locale('ru')

import {Link} from 'react-router'
import Button from 'react-bootstrap/lib/Button'
import Table from 'react-bootstrap/lib/Table'
import Input from 'react-bootstrap/lib/Input'
import Col from 'react-bootstrap/lib/Col'

import {asyncConnect} from 'redux-async-connect'
import {load as loadModules, getModules, findModule, hide as hideModule} from 'redux/modules/modules'
import {routeActions} from 'react-router-redux'

import compileKatex from 'utils/compileKatex'


@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch}}) => {
    return dispatch(loadModules())
  }
}])
@connect(
  state => ({
    modules: getModules(state),
    isStudent: state.auth.user.role === 'student'
  }),
  {loadModules, findModule, hideModule, pushState: routeActions.push}
)
export default class ModulesList extends Component {
  static propTypes = {
    modules: PropTypes.any.isRequired,
    findModule: PropTypes.func.isRequired,
    hideModule: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    isStudent: PropTypes.bool.isRequired
  }

  componentDidMount() {
    compileKatex(findDOMNode(this))
  }

  componentDidUpdate() {
    compileKatex(findDOMNode(this))
  }

  search(textQuery) {
    this.props.findModule({name: textQuery})
  }

  searchEvent(event) {
    event.preventDefault()
    this.search(this.state.query)
  }

  render() {
    let {modules: {data}, isStudent} = this.props

    return (
      <div className="container">
        <Helmet title="Список модулей"/>
        <h1>Список модулей</h1>
        <form onSubmit={::this.searchEvent}>
          <Col xs={12} lg={3} md={3} sm={4}>
            <Input type="text" placeholder="Поиск модуля"
                   onChange={({target}) => { this.setState({ query: target.value }); this.search(target.value) }}/>
          </Col>
        </form>
        {!isStudent &&
        <Col xs={2} lg={2} md={2} sm={2}>
          <Button onClick={() => this.props.pushState('/addModule')}>Добавить модуль</Button>
        </Col>
        }
        <Col xs={12} sm={12} md={12} lg={12}>
          {
            Array.isArray(data) && data.length > 0 &&
            <Table responsive>
              <thead>
              <tr>
                <th>Название</th>
                <th>Автор</th>
                <th>Дата создания</th>
              </tr>
              </thead>
              <tbody>
              {
                data
                  .filter(module => !module.hidden)
                  .map(module =>
                  <tr key={module._id}>
                    <td className="katexable"><Link to={`/modulePreview/${module._id}`}>{module.name}</Link></td>
                    <td>{module.author.username}</td>
                    <td>{moment(new Date(module.created)).calendar()}</td>
                    <td><Button onClick={() => this.props.hideModule(module._id)}>удалить</Button></td>
                  </tr>
                )
              }
              </tbody>
            </Table>
          }
          {
            !(Array.isArray(data) && data.length > 0) &&
            <div>Пока модулей еще нет. Вы можете <Link to="/addModule">создать первый</Link>.</div>
          }
        </Col>
      </div>
    )
  }
}

```

Основные вещи, которые импортируются:

```
import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
```

Первое - базовый набор для работы с реактом.
Второе - та самая магия, за что redux полюбился многим.

Суть магии вот в чем. Перед компонентом (классом) пишется декоратор:

```
@connect(
  state => ({
    modules: getModules(state),
    isStudent: state.auth.user.role === 'student'
  }),
  {loadModules, findModule, hideModule, pushState: routeActions.push}
)
```

Декоратор (в данном случае) - это функция, которая принимает класс, описанный под ним, а также аргументы, которые передаются в него как в обычную функцию.

`connect` первым аргументом ожидает чистую функцию, которая сделает mapping текущего состояния хранилища на props компонента. `state` - это текущее состояние хранилища. Дальше, эта функция вернет объект с двумя свойствами: `modules` и `isStudent`. Первое - список модулей, второе - булевская переменная, которая показывает, является ли текущий пользователем студентом. Это необходимо для разграничения прав доступа. На этой проверке разграничение, конечно, не начинается и не заканчивается. Это лишь удобный способ для работы с фронтендом.

`getModules` - это так называемый selector. Еще один тип сущности в добавок к редьюсерам и экшенам. Селекоторы - это чистые функции (неожиданно, да?). Принимают текущее состояние и, возможно, какие-то дополнительные параметры, чтобы конкретизировать необходимые сущности из состояния. В целом, использование селекторов - хорошая практика. В моем коде они не везде, потому что по мере написания кода мое представление (представление любого программиста) меняется. Раньше я не видел в них большой необходимости, но теперь склоняюсь к тому, что они облегчают и написание, и читабельность. Однако, требуют более вдумчивого понимания того, что хочется достичь. Для работы с селекторами существует reselect. Небольшая библиотека, включающая некоторые оптимизации. В этом проекте она не используется, хотя может будет в дальнейшем. Я о ней упомянул, чтобы просто довести до сведения. 

Второй аргумент `connect` - это функция, либо объект (обычно объект, пока не требуется более мощный инструмент для указания каких-либо параметров). Если это функция, то она все равно возвращает объект. Каждое свойство этого объекта - это функция. Эти функции возвращают экшены (ага, простые объекты). Запутанно? Может показаться на первый взгляд, что да. Но все нормально. Интуиция всего этого дела гораздо проще строгого описания в терминах сигнатур. 

Здесь (во втором аргументе connect) буквально происходит следующее:

```
import {bindActionCreators} from 'redux'
// какие-то еще импорты 
// ...

@connect(
    state => ({/* Тут маппинг текущего состояния на props */}),
    dispatch => bindActionCreators({/* функции, которые возвращают экшены */}, dispatch))
```
Подробнее: http://redux.js.org/docs/api/bindActionCreators.html

Все свойства из объекта во втором аргументе connect также попадают в props комонента. Например, если внутри компонента вызывается `this.props.findModule()`, то тогда вызывается _чистая_ функция `findModule`, которая возвращает экшен. Этот экшен автоматически передается в dispatch. После этого этот экшен попадает в редьюсеры. Редьюсер принимает решение, менять как-то состояние из-за пришедшего экшена, либо нет.

Например, есть такой метод:

```
  search(textQuery) {
    this.props.findModule({name: textQuery})
  }
```

Сначала вызывается функция `findModule`:

```
export function findModule(query) {
  return {
    types: [FIND, FIND_SUCCESS, FIND_FAIL],
    promise: client => client.post('/module/loadByQuery', {
      data: {
        query
      }
    })
  }
}
``` 

Функция не делает ничего. Просто возвращает объект, у которого есть два свойства: `types` и `promise`. Об этих свойствах расскажу чуть дальше, пока продолжим следить за потоком дальше.

Только что возвращенный из findModule объект через dispatch (автоматически!) сообщается в store, и вызываются редьюсеры.

Есть такой редьюсер: 

```
export let handlers = {
  // ...
  // тут другие методы

  [FIND](state) {
    return {
      ...state,
      loading: true
    }
  },

  [FIND_SUCCESS](state, action) {
    return {
      ...state,
      data: action.result,
      error: null,
      loading: false,
      loaded: true
    }
  },

  [FIND_FAIL](state, {error}) {
    return {
      ...state,
      data: null,
      error,
      loading: false,
      loaded: false
    }
  }
  
  // тут еще методы
  // ...
}

```

По мере выполнения промиса вызывается один из этих трех методов. Когда промис только начал исполнение (`type === FIND`), то состояние помечается как `loading: true`. А когда промис выполнится (`FIND_SUCCESS`), то в свойство data кладутся полученные данные. 

Вот, состояние хранилища поменялось. Снова вызывается маппинг, указанный в `@connect`. В компонент попадают новые props. Вот и все основное!

Доки будут пополняться. 