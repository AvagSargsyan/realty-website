import { infoRoute } from '../info-route'

const route = infoRoute('about')
export const generateMetadata = route.generateMetadata
export default route.Page
