// user config --->
const inputDirectoryPath = process.argv[2] || './MCM_Records';
const outputDirectoryPath = process.argv[3] || inputDirectoryPath+'/merged_records';
// <--- user config

const fs = require('fs');
const path = require('path');
const _isEqualWith = require('./_isEqualWith.js')
// Function to create directory if it doesn't exist
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
}
function customizer(recordItem, AnotherRecordItem) {
  const a = Object.entries(recordItem).filter(tuple => tuple[0] === 'option');
  const b = Object.entries(AnotherRecordItem).filter(tuple => tuple[0] === 'option');

  if (_isEqualWith(a,b)) {
    return true
  } else {
    return false
  }
}

ensureDirectoryExistence(outputDirectoryPath);
// 检查是否符合MCM_Record文件的命名规则
const isMCMRecordFile = (filename) => /^\d{4}_.+$/.test(filename);

// 读取目录中的所有文件
fs.readdir(inputDirectoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory: ' + err);
  }

  // 过滤出符合命名规则的文件
  const mcmFiles = files.filter(file => isMCMRecordFile(file));
  const records = {};

  mcmFiles.forEach(file => {
    const filepath = path.join(inputDirectoryPath, file);
    const recordData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    const modName = file.split('_').slice(1).join('_');
    const randomNumber = parseInt(file.split('_')[0]);

    if (!records[modName]) {
      records[modName] = {
        randomNumber: randomNumber,
        items: []
      };
    } else {
      records[modName].randomNumber = Math.min(records[modName].randomNumber, randomNumber);
    }

    recordData.forEach(thisRecordItem => {
      // 去重逻辑
      const similarIndex = records[modName].items.findIndex(
        item => _isEqualWith(item, thisRecordItem, customizer)
      );
      if (similarIndex !== -1) { // 如果有相似的record_item
        records[modName].items.splice(similarIndex, 1); // 就删除那个record_item
      }

      records[modName].items.push(thisRecordItem);
    });
  });

  // 写入合并后的文件
  Object.keys(records).forEach(modName => {
    const newFilename = `${records[modName].randomNumber}_${modName}.json`;
    const newFilePath = path.join(outputDirectoryPath, newFilename);
    fs.writeFileSync(newFilePath, JSON.stringify(records[modName].items, null, 2), 'utf8');
  });

  console.log('Merge completed successfully.');
});
