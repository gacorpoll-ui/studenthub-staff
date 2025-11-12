export const environment = {
  production: false,
  envName: 'saoud',
  apiEndpoint: 'http://localhost/~Saoud/studenthub/studenthub/staff/web/v1',
  permanentBucketUrl: 'https://studenthub-uploads-dev-server.s3.amazonaws.com/',
  cloudinaryUrl: 'https://res.cloudinary.com/studenthub/image/upload/c_thumb,w_200,h_200,g_face,q_auto:low/v1596525812/dev/',
  meilisearchCandidateIndex: 'saoud_candidate_public',
  meilisearchFulltimerIndex: 'saoud_fulltimer_public',
  meilisearchCacheDuration: 5 * 60 * 1000, // 5 min in millisecond
  environmentName: 'Saoud Local Machine',
  s3Domain: 'studenthub-uploads-dev-server',
  marker: null,//'assets/images/car.svg',
  serviceWorker: false,
  mixpanelKey: 'ac62dbe81767f8871f754c7bdf6669d6',
};
