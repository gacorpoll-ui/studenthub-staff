export const environment = {
  production: true,
  serviceWorker: true,
  envName: 'prod',
  apiEndpoint: 'https://staff.api.studenthub.co/v1',
  permanentBucketUrl: 'https://studenthub-uploads.s3.amazonaws.com/',
  cloudinaryUrl: 'https://res.cloudinary.com/studenthub/image/upload/c_thumb,w_200,h_200,g_face,q_auto/v1596525812/',
  meilisearchCandidateIndex: 'prod_candidate_public',
  meilisearchFulltimerIndex: 'prod_fulltimer_public',
  meilisearchCacheDuration: 5 * 60 * 1000, // 5 min in millisecond
  marker: null,//'assets/images/car.svg',
  environmentName: 'Production Server',
  mixpanelKey: '1571d4a3355f1a2fec86bd0ba6dc912b'
};
