import jetpack from 'fs-jetpack';
import * as path from 'path';
import { merge } from 'lodash-es';

// user config --->
const inputDirectoryPath = process.argv[2] || './MCM_Records';
const outputDirectoryPath = process.argv[3] || inputDirectoryPath+'/merged_records';
// <--- user config

interface MCMRecord {
  Mod: string;
  page: string;
  Click?: string;
  option?: string;
  toggle?: 'On' | 'Off';
  slider?: number;
  [key: string]: string | number;
}
// interface MCMSetting {
//   mod?: string;
//   pages?: [{
//       page: string,
//       options?: [{
//         option: string,
//         [key: string]: string | number;
//       }],
//       clicks?: string[]
//     }]
// }


const mergeMCMRecords = (records: MCMRecord[]): MCMRecord[] => {
  const mergedRecords: { [key: string]: MCMRecord } = {};
  // const mcmSetting : MCMSetting = {};

  records.forEach(record => {

    const key = `${record.Mod}_${record.page}_${record.option ? record.option : ''}_${ record.Click ? record.Click : ''}}`;
    if (mergedRecords[key]) {
      mergedRecords[key] = merge(mergedRecords[key], record);
    } else {
      mergedRecords[key] = record;
    }

  });

  return Object.values(mergedRecords);
};

const main = async () => {
  const files = await jetpack.findAsync(inputDirectoryPath, { matching: '*.json' });

  const modRecords: { [modName: string]: { maxOrder: number, records: MCMRecord[] } } = {};

  for (const file of files) {
    const fileName = path.basename(file, '.json');
    const [orderStr, modName] = fileName.split('_');
    const order = parseInt(orderStr, 10);

    if (!modRecords[modName]) {
      modRecords[modName] = { maxOrder: order, records: [] };
    } else {
      modRecords[modName].maxOrder = Math.max(modRecords[modName].maxOrder, order);
    }

    const fileContent = await jetpack.readAsync(file, 'json') as MCMRecord[];
    modRecords[modName].records = modRecords[modName].records.concat(fileContent);
  }

  for (const [modName, { maxOrder, records }] of Object.entries(modRecords)) {
    const mergedRecords = mergeMCMRecords(records);
    const newFileName = `${String(maxOrder).padStart(4, '0')}_${modName}.json`;
    const newFilePath = path.join(outputDirectoryPath, newFileName);
    await jetpack.writeAsync(newFilePath, mergedRecords);
  }
};

main().catch(console.error);
