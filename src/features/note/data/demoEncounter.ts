import type { Encounter } from '../model/types';

/**
 * A synthetic encounter. Every name, line and value here is invented. Nothing
 * comes from a real patient, clinic or product.
 */
export const demoEncounter: Encounter = {
  patient: {
    name: 'Ada Lindqvist',
    age: 61,
    born: '14 Feb 1965',
    record: 'MRN 0041-2287',
    episode: 'Socket replacement, left transtibial',
  },
  visit: {
    title: 'Face-to-face follow-up',
    date: '8 Nov 2026',
    clinician: 'R. Moreau, CPO',
    clinicianInitials: 'RM',
    organisation: 'Harbour Prosthetics',
    length: 91,
  },
  transcript: [
    {
      id: 't1',
      speaker: 'Clinician',
      time: '00:04',
      segments: [{ text: 'Morning, Ada. What brings you in today?' }],
    },
    {
      id: 't2',
      speaker: 'Patient',
      time: '00:09',
      segments: [
        { text: 'The socket again. ' },
        {
          text: "It's fine first thing, but by mid-afternoon it's loose and rubbing at the front.",
          span: 's-reason',
        },
      ],
    },
    {
      id: 't3',
      speaker: 'Clinician',
      time: '00:21',
      segments: [{ text: 'Still the left side, below the knee?' }],
    },
    {
      id: 't4',
      speaker: 'Patient',
      time: '00:24',
      segments: [
        { text: 'Yes, left, below the knee.', span: 's-level' },
        { text: ' ' },
        { text: 'It was about three years ago now, in March.', span: 's-date-patient' },
      ],
    },
    {
      id: 't5',
      speaker: 'Clinician',
      time: '00:33',
      segments: [
        { text: 'The referral letter has the surgery in March 2021,', span: 's-date-referral' },
        { text: ' so closer to six?' },
      ],
    },
    {
      id: 't6',
      speaker: 'Patient',
      time: '00:40',
      segments: [{ text: "Is it? Then I've lost a few years somewhere." }],
    },
    {
      id: 't7',
      speaker: 'Clinician',
      time: '00:46',
      segments: [{ text: "What would you like to be doing that you can't right now?" }],
    },
    {
      id: 't8',
      speaker: 'Patient',
      time: '00:51',
      segments: [
        { text: "Walking the dog down to the harbour and back. It's about two kilometres.", span: 's-goal' },
        { text: ' ' },
        { text: 'Most days I manage without the cane, just slower on the hill.', span: 's-walk' },
      ],
    },
    {
      id: 't9',
      speaker: 'Clinician',
      time: '01:07',
      segments: [{ text: 'Anything new health-wise since the last fitting?' }],
    },
    {
      id: 't10',
      speaker: 'Patient',
      time: '01:12',
      segments: [
        { text: 'My sugars are better, the diabetes nurse is happy.', span: 's-diabetes' },
        { text: ' ' },
        { text: "And I've lost about six kilos, which probably explains the socket.", span: 's-weight' },
      ],
    },
    {
      id: 't11',
      speaker: 'Clinician',
      time: '01:26',
      segments: [
        { text: 'That would do it. ' },
        { text: "I'll watch you walk on the flat and the ramp before we decide anything.", span: 's-gait' },
      ],
    },
  ],
  addendum: {
    id: 't12',
    speaker: 'Clinician',
    time: '01:34',
    segments: [{ text: "Right, shoes on. Let's go and have a look at that walk." }],
  },
  fields: [
    {
      id: 'reason',
      label: 'Reason for visit',
      kind: 'cited',
      draft: 'Socket loosens by mid-afternoon, with rubbing at the anterior residual limb.',
      sources: ['s-reason'],
    },
    {
      id: 'level',
      label: 'Amputation level',
      kind: 'cited',
      draft: 'Transtibial, left',
      sources: ['s-level'],
    },
    {
      id: 'date',
      label: 'Date of amputation',
      kind: 'conflict',
      question: 'Which amputation date goes on the note?',
      prompt: 'The patient and the referral letter do not agree.',
      sources: ['s-date-patient', 's-date-referral'],
      options: [
        {
          id: 'mar-2021',
          label: 'March 2021',
          detail: 'From the referral letter',
          sources: ['s-date-referral'],
        },
        {
          id: 'mar-2023',
          label: 'March 2023',
          detail: 'From the patient: “about three years ago”',
          sources: ['s-date-patient'],
        },
      ],
    },
    {
      id: 'goals',
      label: 'Functional goals',
      kind: 'cited',
      draft: 'Walk the dog to the harbour and back, about 2 km.',
      sources: ['s-goal'],
    },
    {
      id: 'history',
      label: 'Relevant history',
      kind: 'cited',
      draft: 'Type 2 diabetes, control improving. About 6 kg weight loss since the last fitting.',
      sources: ['s-diabetes', 's-weight'],
    },
    {
      id: 'pain',
      label: 'Pain at rest',
      kind: 'gap',
      question: 'No one talked about pain at rest. What goes on the note?',
      prompt: 'The draft left this field empty.',
      sources: [],
      options: [
        {
          id: 'not-assessed',
          label: 'Not assessed at this visit',
          detail: 'The note says this clearly',
          value: 'Not assessed',
          sources: [],
        },
        { id: 'typed', label: 'Type a value', detail: 'Write what you know', freeText: true, sources: [] },
      ],
    },
    {
      id: 'k',
      label: 'Functional level',
      kind: 'judgment',
      question: 'Which functional level did you observe?',
      prompt: 'This is a clinical decision. These lines can help. You decide.',
      sources: ['s-walk', 's-gait'],
      options: [
        { id: 'K1', label: 'K1', detail: 'Transfers, fixed cadence indoors', sources: [] },
        { id: 'K2', label: 'K2', detail: 'Low barriers, limited community', sources: [] },
        { id: 'K3', label: 'K3', detail: 'Variable cadence, most barriers', sources: [] },
        { id: 'K4', label: 'K4', detail: 'Beyond basic ambulation', sources: [] },
      ],
    },
  ],
  noteDocId: 'note',
  episode: {
    docs: [
      { id: 'referral', title: 'Referral letter', detail: 'Dr. N. Ahlberg · received 2 Nov', state: 'done' },
      { id: 'note', title: 'Face-to-face encounter note', detail: 'Signed just now', state: 'new' },
      {
        id: 'gait',
        title: 'Functional assessment',
        detail: 'Gait on flat ground and on the ramp',
        state: 'todo',
      },
      {
        id: 'order',
        title: 'Written order',
        detail: 'Needs the functional assessment first',
        state: 'blocked',
      },
    ],
    pathway: [
      { label: 'Referral', when: '2 Nov', state: 'done' },
      { label: 'Visit', when: 'Today', state: 'done' },
      { label: 'Note', when: 'Now', state: 'now' },
      { label: 'Gait test', when: 'Next', state: 'next' },
      { label: 'Order', when: '', state: 'later' },
      { label: 'Fitting', when: '', state: 'later' },
    ],
  },
};
