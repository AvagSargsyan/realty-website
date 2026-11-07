import { infoRoute } from '../info-route'

const route = infoRoute('terms')
export const generateMetadata = route.generateMetadata
export default route.Page
