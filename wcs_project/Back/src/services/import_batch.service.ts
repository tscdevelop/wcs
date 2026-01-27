import { ImportService } from './import_execel.service';
import { ApiResponse } from '../models/api-response.model';

export class ImportBatchService {
  private importService = new ImportService();

  async importUsageByBatch(
    data: any[],
    reqUsername: string,
    batchSize = 100
  ): Promise<ApiResponse<any>> {

    const response = new ApiResponse<any>();
    let successRows = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchStartRow = i + 1;

      try {
        await this.importService.createUsageJson(batch, reqUsername);
        successRows += batch.length;

      } catch (error: any) {

        return response.setIncomplete(
          `Import failed at row ${batchStartRow}. ` +
          `Imported ${successRows}/${data.length} rows. ` +
          `Error: ${error.message}`,
          true
        );
      }
    }

    // success case → ส่ง data ได้
    return response.setComplete(
      'Import completed successfully',
      {
        total_rows: data.length,
        batch_size: batchSize,
        success_rows: successRows,
      }
    );
  }
}
