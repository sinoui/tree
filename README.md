# sinoui-tree

这是由[ts-lib-scripts](https://github.com/sinoui/ts-lib-scripts)创建的TypeScript库项目。

## 本地开发

项目中有以下有用的命令。

### `yarn build`

打包，并将打包文件放在`dist`文件夹中。使用 rollup 对代码做优化并打包成多种格式（`Common JS`，`UMD`和`ES Module`）。

### `yarn lint`

`yarn lint`会检查整个项目是否有代码错误、风格错误。

开启 vscode 的 eslint、prettier 插件，在使用 vscode 编码时，就会自动修正风格错误、提示语法错误。

### `yarn format`

`yarn format`可以自动调整整个项目的代码风格问题。

### `yarn test`

`yarn test`以监听模式启动 jest，运行单元测试。

开启 vscode 的 jest 插件，会在文件变化时自动运行单元测试。

### 添加模块

```shell
yarn gen my-ts-module
```

### 预览文档

```shell
yarn doc:dev
```

### 编译并打包文档

```shell
yarn doc:publish
```

### 发布文档

在发布文档之前，在`package.json`中配置好`homepage`，如下所示：

```json
{
  "homepage": "https://sinouiincubator.github.io/editable-data-table"
}
```

配置完之后就可以执行下面的命令行发布文档：

```shell
yarn doc:publish
```
