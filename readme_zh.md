## 项目简介

本项目是一个用于合并MCM记录的工具。它接受一个输入目录路径和一个输出目录路径作为命令行参数，然后将输入目录中的所有MCM记录文件合并到一个输出文件中。

## 使用方法

1. 确保你已经安装了Node.js。
2. 在命令行中，导航到项目目录。
3. 运行以下命令：

```bash
node MCM_records_merge_tool.js <input_directory_path> <output_directory_path>
```

其中，`<input_directory_path>` 是输入目录的路径，
`<output_directory_path>` 是输出目录的路径。
如果省略 `<output_directory_path>`，则输出目录将默认为输入目录。


## 注意事项

- 请确保输入目录中只包含MCM记录文件。其他类型的文件将被忽略。