export interface Clip {
  _id: string;
  heading: string;
  textToCopy: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClipRequest {
  heading: string;
  textToCopy: string[];
}

export interface UpdateClipRequest {
  heading?: string;
  textToCopy?: string[];
}
