import * as jetpack from 'fs-jetpack';
import * as path from 'path';
import { merge } from 'lodash';

const targetDirectory = './MCM_Records'; // 替换为你的目标目录

interface MCMRecord {
  Mod: string;
  option?: string;
  page: string;
  toggle?: 'On' | 'Off';
  slider?: number;
  [key: string]: string | number;
}

const mergeMCMRecords = (records: MCMRecord[]): MCMRecord[] => {
  const mergedRecords: { [key: string]: MCMRecord } = {};
  
  records.forEach(record => {
    const key = `${record.Mod}_${record.page}`;
    if (mergedRecords[key]) {
      mergedRecords[key] = merge(mergedRecords[key], record);
    } else {
      mergedRecords[key] = record;
    }
  });

  return Object.values(mergedRecords);
};

const main = async () => {
  const files = await jetpack.findAsync(targetDirectory, { matching: '*.json' });

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
    const newFilePath = path.join(targetDirectory, newFileName);
    await jetpack.writeAsync(newFilePath, mergedRecords);
  }
};

main().catch(console.error);
