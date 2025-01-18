import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { Recruiter, RecruiterSchema, CSVService } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class FileCSVService implements CSVService {
  private readonly filePath: string;

  constructor(filePath: string = config.paths.csv) {
    this.filePath = filePath;
  }

  async readRecruiters(): Promise<Recruiter[]> {
    try {
      const records: Recruiter[] = [];
      const parser = createReadStream(this.filePath).pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
        })
      );

      for await (const record of parser) {
        try {
          const recruiter = RecruiterSchema.parse({
            ...record,
            ReachOutCount: parseInt(record.ReachOutCount, 10),
          });
          records.push(recruiter);
        } catch (error) {
          logger.warn(`Invalid record in CSV: ${JSON.stringify(record)}`, { error });
        }
      }

      return records;
    } catch (error) {
      logger.error('Error reading CSV file', { error });
      throw new Error('Failed to read recruiters CSV file');
    }
  }

  async updateRecruiters(recruiters: Recruiter[]): Promise<void> {
    try {
      const stringifier = stringify({
        header: true,
        columns: ['Name', 'Email', 'ReachOutCount', 'Status', 'LastContactDate'],
      });

      const csvContent = await new Promise<string>((resolve, reject) => {
        const chunks: string[] = [];
        stringifier.on('readable', () => {
          let chunk;
          while ((chunk = stringifier.read()) !== null) {
            chunks.push(chunk);
          }
        });
        stringifier.on('error', reject);
        stringifier.on('finish', () => resolve(chunks.join('')));

        recruiters.forEach(recruiter => stringifier.write(recruiter));
        stringifier.end();
      });

      await fs.writeFile(this.filePath, csvContent);
      logger.info('CSV file updated successfully');
    } catch (error) {
      logger.error('Error updating CSV file', { error });
      throw new Error('Failed to update recruiters CSV file');
    }
  }
}
