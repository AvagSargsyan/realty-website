import { infoRoute } from '../info-route'

const route = infoRoute('privacy')
export const generateMetadata = route.generateMetadata
export default route.Page
