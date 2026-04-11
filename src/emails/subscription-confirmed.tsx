import * as React from 'react'
import {
  Html, Head, Preview, Body, Container, Section,
  Heading, Text, Hr, Img, Link, Font,
} from '@react-email/components'

interface SubscriptionConfirmedProps {
  customerName: string
  buildingName: string
  unit: string
  cutName: string
  cutDetail: string
  price: number
  nextDelivery: string
}

export default function SubscriptionConfirmed({
  customerName  = 'James',
  buildingName  = 'Aspire Post Oak',
  unit          = '1204',
  cutName       = 'Ribeye',
  cutDetail     = '16oz bone-in · 21-day dry-aged',
  price         = 89,
  nextDelivery  = 'May 1, 2026',
}: SubscriptionConfirmedProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Cormorant"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/cormorant/v22/H4cgBXOCl9bbnla_nHIiRLmYgoyyYB-WCgMB.woff2',
            format: 'woff2',
          }}
          fontWeight={300}
          fontStyle="normal"
        />
      </Head>
      <Preview>You&apos;re in. First delivery {nextDelivery} to Unit {unit} at {buildingName}.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* HEADER */}
          <Section style={header}>
            <Text style={logo}>🐄 Automatic Cow</Text>
            <Text style={logoSub}>Houston · Members Only</Text>
          </Section>

          {/* HERO BAND */}
          <Section style={heroBand}>
            <Heading style={heroHeading}>You&apos;re in.</Heading>
            <Text style={heroSub}>Membership confirmed. Welcome to the herd.</Text>
          </Section>

          {/* ORDER CARD */}
          <Section style={card}>
            <Text style={cardLabel}>YOUR SUBSCRIPTION</Text>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={rowLabel}>Cut</td>
                  <td style={rowValue}>{cutName}</td>
                </tr>
                <tr>
                  <td style={rowLabel}>Details</td>
                  <td style={rowValue}>{cutDetail}</td>
                </tr>
                <tr>
                  <td style={rowLabel}>Building</td>
                  <td style={rowValue}>{buildingName}</td>
                </tr>
                <tr>
                  <td style={rowLabel}>Unit</td>
                  <td style={rowValue}>{unit}</td>
                </tr>
                <tr>
                  <td style={rowLabel}>First Delivery</td>
                  <td style={rowValue}>{nextDelivery}</td>
                </tr>
                <tr>
                  <td style={rowLabel}>Billing</td>
                  <td style={rowValue}>Weekly · Every Saturday</td>
                </tr>
              </tbody>
            </table>

            <Hr style={divider} />

            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ ...rowLabel, fontSize: 13 }}>Weekly Total</td>
                  <td style={priceCell}>${price}/week</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* DELIVERY NOTE */}
          <Section style={deliveryNote}>
            <Text style={deliveryIcon}>🚪</Text>
            <Text style={deliveryText}>
              <strong style={{ color: '#e8d8b0' }}>Delivered to your door, Every Saturday.</strong>
              {' '}Vacuum-sealed with dry ice, coordinated with your concierge at {buildingName}. No signature required.
            </Text>
          </Section>

          {/* WHAT TO EXPECT */}
          <Section style={steps}>
            <Text style={stepsTitle}>What happens next</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['01', 'We source your cut', 'From our network of USDA Prime and A5 suppliers.'],
                  ['02', 'Packaged for perfection', 'Vacuum-sealed, dry-ice packed, restaurant quality.'],
                  ['03', 'Delivered to your unit', `Coordinated with your concierge at ${buildingName}.`],
                ].map(([num, title, sub]) => (
                  <tr key={num}>
                    <td style={stepNum}>{num}</td>
                    <td style={stepBody}>
                      <strong style={{ color: '#e8d8b0', display: 'block', marginBottom: 2 }}>{title}</strong>
                      <span style={{ color: '#8a7a62', fontSize: 12 }}>{sub}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* FOOTER */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or contact us anytime.
            </Text>
            <Text style={footerText}>
              You can cancel anytime from your member dashboard.
            </Text>
            <Text style={{ ...footerText, marginTop: 20, color: '#4a3e2a' }}>
              © {new Date().getFullYear()} Automatic Cow · Houston, TX
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#0d0b08',
  fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '32px 0',
}

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  backgroundColor: '#13110d',
  border: '1px solid #2a2218',
}

const header: React.CSSProperties = {
  padding: '28px 40px 20px',
  borderBottom: '1px solid #2a2218',
}

const logo: React.CSSProperties = {
  fontFamily: "'Cormorant', Georgia, serif",
  fontSize: 22,
  fontWeight: 300,
  color: '#e8d8b0',
  margin: 0,
  letterSpacing: '0.02em',
}

const logoSub: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.4em',
  textTransform: 'uppercase' as const,
  color: '#b8863a',
  margin: '4px 0 0',
}

const heroBand: React.CSSProperties = {
  padding: '40px 40px 32px',
  borderBottom: '1px solid #2a2218',
  background: 'linear-gradient(135deg, #1a1208 0%, #0d0b08 100%)',
}

const heroHeading: React.CSSProperties = {
  fontFamily: "'Cormorant', Georgia, serif",
  fontSize: 52,
  fontWeight: 300,
  fontStyle: 'italic',
  color: '#b8863a',
  margin: '0 0 8px',
  lineHeight: 1,
}

const heroSub: React.CSSProperties = {
  fontSize: 14,
  color: '#8a7a62',
  margin: 0,
  fontWeight: 300,
  letterSpacing: '0.05em',
}

const card: React.CSSProperties = {
  margin: '0',
  padding: '32px 40px',
  borderBottom: '1px solid #2a2218',
}

const cardLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.36em',
  color: '#b8863a',
  margin: '0 0 20px',
}

const rowLabel: React.CSSProperties = {
  fontSize: 11,
  color: '#6a5c44',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  padding: '7px 0',
  width: '40%',
  verticalAlign: 'top',
}

const rowValue: React.CSSProperties = {
  fontSize: 13,
  color: '#c8b898',
  padding: '7px 0',
  verticalAlign: 'top',
}

const divider: React.CSSProperties = {
  borderColor: '#2a2218',
  margin: '20px 0',
}

const priceCell: React.CSSProperties = {
  fontFamily: "'Cormorant', Georgia, serif",
  fontSize: 26,
  fontWeight: 300,
  color: '#b8863a',
  textAlign: 'right' as const,
}

const deliveryNote: React.CSSProperties = {
  padding: '24px 40px',
  borderBottom: '1px solid #2a2218',
  background: '#111009',
  display: 'flex',
}

const deliveryIcon: React.CSSProperties = {
  fontSize: 24,
  margin: '0 0 8px',
}

const deliveryText: React.CSSProperties = {
  fontSize: 13,
  color: '#8a7a62',
  lineHeight: 1.7,
  margin: 0,
  fontWeight: 300,
}

const steps: React.CSSProperties = {
  padding: '32px 40px',
  borderBottom: '1px solid #2a2218',
}

const stepsTitle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.36em',
  color: '#b8863a',
  margin: '0 0 20px',
  textTransform: 'uppercase' as const,
}

const stepNum: React.CSSProperties = {
  fontFamily: "'Cormorant', Georgia, serif",
  fontSize: 32,
  fontWeight: 300,
  color: '#2a2218',
  width: 48,
  verticalAlign: 'top',
  paddingBottom: 20,
  lineHeight: 1,
}

const stepBody: React.CSSProperties = {
  fontSize: 13,
  paddingBottom: 20,
  verticalAlign: 'top',
  paddingTop: 4,
}

const footerDivider: React.CSSProperties = {
  borderColor: '#2a2218',
  margin: 0,
}

const footer: React.CSSProperties = {
  padding: '24px 40px',
}

const footerText: React.CSSProperties = {
  fontSize: 11,
  color: '#6a5c44',
  margin: '0 0 6px',
  lineHeight: 1.6,
}
