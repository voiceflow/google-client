export interface Slot {
  name: string;
  type: {
    value: string;
  };
}

export interface SkillMetadata {
  creator_id: number;
  restart: boolean;
  resume_prompt: any;
  error_prompt: any;
  diagram: string;
  global: string[];
  repeat: number;
  slots: Slot[];
  fulfillment: Record<string, any>;
}
export interface Audio {
  url: string;
  title?: string;
  description?: string;
  icon?: string;
  background?: string;
  offset: number;
}
