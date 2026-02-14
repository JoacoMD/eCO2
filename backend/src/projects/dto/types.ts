export type UpdateProjectRequest = {
    name?: string;
    description?: string;
    image?: string;
    website?: string;
}

export type CreateMilestoneRequest = {
    id: number;
    title: string;
    url: string;
}