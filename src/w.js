const fs = require('fs');
const path = require('path');

// 读取目录中的所有文件
const directoryPath = './MCM_Records'; // 指定你的目录路径
const files = fs.readdirSync(directoryPath);

// 过滤出符合命名规则的JSON文件
const jsonFiles = files.filter(file => /^\d{4}_.+\.json$/.test(file));

// 用于存储合并后的记录
const mergedRecords = {};

// 读取并合并JSON文件内容
jsonFiles.forEach(file => {
  const filePath = path.join(directoryPath, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = JSON.parse(fileContent);

  // 提取modName和4DigitRandomNumber
  const [randomNumber, modNameWithExtension] = file.split('_');
  const modName = modNameWithExtension.replace('.json', '');

  // 如果该modName还未在mergedRecords中添加，则初始化一个空数组
  if (!mergedRecords[modName]) {
    mergedRecords[modName] = {
      minRandomNumber: randomNumber,
      records: []
    };
  }

  // 更新最小的randomNumber
  if (randomNumber < mergedRecords[modName].minRandomNumber) {
    mergedRecords[modName].minRandomNumber = randomNumber;
  }

  // 合并记录
  records.forEach(record => {
    mergedRecords[modName].records.push(record);
  });
});

// 写入合并后的JSON文件
Object.keys(mergedRecords).forEach(modName => {
  const { minRandomNumber, records } = mergedRecords[modName];
  const outputFileName = `${minRandomNumber}_${modName}.json`;
  const outputFilePath = path.join(directoryPath, outputFileName);

  // 去重并写入文件
  const uniqueRecords = Array.from(new Set(records.map(JSON.stringify))).map(JSON.parse);

  fs.writeFileSync(outputFilePath, JSON.stringify(uniqueRecords, null, 2), 'utf-8');
});

console.log('合并完成');
