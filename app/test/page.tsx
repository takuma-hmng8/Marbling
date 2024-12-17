import s from './style.module.scss';
import Link from 'next/link';

export default function Page() {
   return (
      <div className={s.page}>
         <div className={s.ctt}>
            <ul>
               <li>
                  <Link className={s.item} href="/test/001/">001: Noise</Link>            
               </li>
               <li>
                  <Link className={s.item} href="/test/002/">002: Blur</Link>            
               </li>
            </ul>                        

         </div>
      </div>
   );
}
