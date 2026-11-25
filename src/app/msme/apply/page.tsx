import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Icon } from '../Icons';
import { MSME_PATH } from '../config';
import ApplyForm from './ApplyForm';
import './apply.css';

/**
 * Application form for the MSME Capacity Development Training.
 *
 * The page from tokopage.zip (apply/index.html). Its header and footer are the
 * site's; the "Programme details" link that was in its header sits above the
 * heading instead. Answers are submitted into the Google Form; see ApplyForm.
 */

export const metadata: Metadata = pageMetadata({
  path: '/msme/apply',
  title: 'Apply: MSME Capacity Development Training',
  description:
    'Application form for the free MSME Capacity Development Training for businesses in Yola North and Yola South. Organised by Toko Academy with GIZ (SEPIN-SUSI Project).',
  image: {
    url: '/images/msme/hero-market-traders.jpg',
    alt: 'Two women in traditional attire trading fresh vegetables at a busy Nigerian market',
    width: 1600,
    height: 1067,
  },
});

export default function MsmeApplyPage() {
  return (
    <>
      <section className="apply-intro">
        <div className="section-container">
          <Link className="back-link" href={MSME_PATH}>
            <Icon name="back" />
            <span>Programme details</span>
          </Link>
          <p className="eyebrow text-brand">Application form · Toko Academy × GIZ SEPIN-SUSI</p>
          <h1>Apply for the MSME Capacity Development Training</h1>
          <p className="lead">Answer based on what is true for your business today, not what you plan to do. There are no right or wrong answers; honest answers help us place you in the training that will help you most.</p>
          <ul className="apply-facts">
            <li><Icon name="tag" /><strong>100% free</strong></li>
            <li><Icon name="cal" />2-week programme</li>
            <li><Icon name="pin" />Yola North &amp; Yola South only</li>
            <li><Icon name="clock" />About 15 minutes</li>
          </ul>
        </div>
      </section>

      <section className="apply-body">
        <div className="section-container apply-layout">
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
