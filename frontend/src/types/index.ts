export type Decision = {
  id: number;
  title: string;
  description?: string;
  projectID?: number;
};

export type DecisionVersion = {
  id: number;
  versionNumber: number;
  label?: string;
  content?: string;
  decisionID: number;
};
