# 小程序分析工具

把下载的 `dist` 放到 `versions` 目录下

修改 `package.json` 的 `ana` 脚本

```
npm i
npm run ana // 这个步骤会生成一份数据到 `versions` 下
```

接来来修改 `web/data.js` 引用这份数据

```
module.exports = require('../versions/5.28.6.ana.json')
```

最后开启分析结果显示页面

```
npm run dev
```


