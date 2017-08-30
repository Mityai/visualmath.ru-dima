Базируется на этом теплейте: https://github.com/erikras/react-redux-universal-hot-example

**ПЕРЕД ЗАПУСКОМ ТЕСТОВ ИЛИ САМОГО ПРОЕКТА НЕ ЗАБЫТЬ ВЫПОЛНИТЬ КОМАНДУ `mongod`**

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

Перепушем нужно сделать следующие вещи:
```
npm run build
git add * # в корне проекта
git commit # ну или git commit -m "comment"
```

Да, `node_modules` не в `.gitignore`. Раньше у сервера было 512 мб оперативки, из-за чего `npm i` не работала до конца. Собираюсь это исправить. 