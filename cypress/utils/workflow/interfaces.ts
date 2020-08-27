export interface WorkflowResponse {
  [status: string]: {
    published: boolean;
    wordCount: number;
    composerId: string;
    lastModifiedBy: string;
  }[];
}
