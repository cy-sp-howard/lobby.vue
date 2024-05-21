import waitingPage from '@/assets/waiting.html?raw'
import logo from '@img/logo.jpg'
import logo_mask from '@img/logo_mask.png'
import _ from 'lodash'

export default import.meta.env.SSR
  ? ''
  : URL.createObjectURL(
      new Blob(
        [
          _.template(waitingPage)({
            logoUrl: new URL(logo, location.origin).toString(),
            logoMaskUrl: new URL(logo_mask, location.origin).toString(),
          }),
        ],
        {
          type: 'text/html',
        },
      ),
    )
