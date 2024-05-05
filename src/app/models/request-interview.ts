import { Candidate } from "./candidate";
import { Contact } from "./contact";
import { Staff } from "./staff";

export class RequestInterview {
    request_interview_uuid: string;
    application_uuid: string;
    request_uuid: string;
    fulltimer_uuid: string;
    candidate_id: number;
    interview_at: string;
    internal_note: string;
    status: number;
    staff_id:  number; //staff assigned to host interview
    interview_note: string;// interview joining link / instruction
    created_by: string;
    created_at: string;
    updated_at: string;
    candidate: Candidate;
    createdBy: Contact;
    staff: Staff;
}