# Domain Intelligence Hub

Flipmain — Domain Investing Platform UI

Build the frontend UI for a product called Flipmain.

Flipmain is an AI-powered domain investing platform. It helps users discover undervalued domains, evaluate them, track their domain portfolio, monitor auctions, and eventually automate domain purchases and resale.

IMPORTANT DESIGN DIRECTION

The product should look like a real premium SaaS / financial research product, not a crypto landing page and not an obvious AI-generated/vibe-coded website.

Think:

Bloomberg Terminal simplified for normal users

premium fintech SaaS

modern domain marketplace

professional investment dashboard

Do NOT use:

neon gradients

purple/blue Web3 gradients

excessive glassmorphism

glowing borders

oversized rounded cards

excessive animations

3D graphics

crypto clichés

generic AI robot imagery

excessive emojis

Use a restrained, professional interface with strong typography, spacing, hierarchy, tables, data visualization and subtle interactions.

BRAND

Product name: Flipmain

Tagline:
Find undervalued domains. Flip with conviction.

Use a simple text-based FLIPMAIN wordmark for now. No complicated logo is needed.

COLOR SYSTEM

Primary background: #0B0D0E
Secondary/card background: #111416
Borders: #24282A
Primary accent: #B8F24A
Primary hover: #C8FF68
Main text: #F2F4F0
Muted text: #8B9290
Success: #6EE7A8
Warning: #F5C451
Danger: #FF6B6B

The lime accent should be used sparingly for important actions, positive numbers, selected navigation states and Flip Score indicators.

TYPOGRAPHY

Use a clean modern sans-serif such as Inter or Geist.

Prioritize:

excellent spacing

readable data

clear hierarchy

compact but not cramped tables

professional financial-product feel

Avoid huge marketing-style headings inside the application.

APP STRUCTURE

Create a desktop-first authenticated application with a persistent left sidebar.

Sidebar:

FLIPMAIN

MAIN

Dashboard

Discover

Auctions

PORTFOLIO

My Domains

Listings

Offers

Watchlist

INTELLIGENCE

AI Insights

Autopilot

Analytics

FINANCE

Wallet

Transactions

Bottom:

Settings

User profile

At the very bottom of the sidebar show:

● Flipmain is hunting

with a small green status indicator.

1. DASHBOARD

Create the main dashboard.

Header:

Good morning

Subtitle:
Your domain portfolio at a glance.

Top-right:
USDC Balance
$1,284.42
[Deposit]

Create four compact metric cards:

Portfolio Cost
$1,240

Estimated Value
$7,850

Unrealized Profit
+$6,610

Domains
37

Below that create a large portfolio performance chart.

Chart title:
Portfolio Performance

Time filters:
7D / 30D / 3M / 1Y / ALL

Keep the chart minimal and professional.

Below the chart create an "AI Opportunities" section.

Table columns:

DOMAIN
ASKING PRICE
EST. VALUE
FLIP SCORE
CATEGORY
ACTION

Example rows:

NovaLedger.com
$42
$1,800
94
Fintech
Buy

OrbitalAI.com
$75
$2,400
91
AI
Buy

VantaFlow.com
$29
$850
87
SaaS
Watch

Use realistic-looking example data.

Add a small section on the right or below called:

Recent Activity

Examples:

Acquired NovaLedger.com for $42

Price alert triggered for OrbitalAI.com

New offer received for VantaFlow.com

Flipmain discovered 1,248 new domains

2. DISCOVER

This is one of the most important screens.

Header:

Discover Domains

Subtitle:
AI-ranked domains with potential resale value.

Top search bar:

Search domains...

Filter controls:

TLD
Price
Flip Score
Category
Auction
Age

Add sorting:

Recommended
Highest Flip Score
Lowest Price
Highest Estimated ROI
Newest

Main content should be a professional table rather than excessive cards.

Columns:

DOMAIN
PRICE
EST. VALUE
EST. ROI
FLIP SCORE
REASON
ACTION

Example:

NovaLedger.com
$42
$1,200–$3,500
+2,757%
94
Strong fintech brand
BUY

Create a visually distinct Flip Score number.

Do not use giant colored circles. Keep it subtle.

3. DOMAIN DETAIL

Clicking a domain should open a detailed domain research page.

Example domain:

NovaLedger.com

Top section:

NovaLedger.com

Status:
Available / Auction

Asking price:
$42

Estimated resale value:
$1,200–$3,500

Flip Score:
94 / 100

Primary CTA:
BUY DOMAIN

Secondary:
WATCH

Create sections:

AI VALUATION

Explain why Flipmain likes the domain.

Example:

"NovaLedger combines a strong brandable prefix with a finance-related keyword. It is short, pronounceable and suitable for fintech, accounting and financial infrastructure companies."

VALUATION FACTORS

Brandability 96
Market Demand 91
Memorability 94
TLD 100
Buyer Pool 89
Risk Low

POTENTIAL BUYERS

Fintech
Accounting SaaS
Crypto infrastructure
Financial AI

COMPARABLE SALES

Create a clean table showing example comparable domains and sale prices.

DOMAIN HISTORY

Show:
Registration age
Previous ownership
Backlinks
Traffic estimate
Trademark risk

Do not claim these are real live results. They are placeholder UI data.

4. MY DOMAINS

Create a portfolio management page.

Header:

My Domains

Top metrics:

Total Domains
37

Total Cost
$1,240

Estimated Value
$7,850

Potential Profit
+$6,610

Create a clean table:

DOMAIN
ACQUIRED
COST
EST. VALUE
STATUS
LIST PRICE
ROI

Include search and filters.

Statuses:
Owned
Listed
Offer Received
Sold

5. AUCTIONS

Create an auction discovery page.

Header:

Domain Auctions

Show auction opportunities in a dense professional table.

Columns:

DOMAIN
CURRENT BID
TIME LEFT
EST. VALUE
FLIP SCORE
BIDS
ACTION

Add a countdown timer to a few example auctions.

Example:

QuantumLedger.com
$38
02h 14m
$1,200–$3,500
94
12 bids

CTA:
View Auction

Do not make this look like a gambling interface.

6. AUTOPILOT

Create a settings page for automated domain acquisition.

Header:

Autopilot

Subtitle:
Let Flipmain automatically find and acquire domains based on your strategy.

Add a prominent but professional status card:

AUTOPILOT
OFF

[Enable Autopilot]

Create configuration controls:

Budget
$1,000 USDC

Maximum purchase per domain
$100

Minimum Flip Score
85

Preferred TLDs
.com
.ai
.io

Categories
AI
Fintech
SaaS
Technology

Maximum domains
25

Strategy:

Conservative
Balanced
Aggressive

Add an "Acquisition Rules" section.

Examples:

Never exceed maximum purchase price

Avoid obvious trademark conflicts

Prefer .com

Require minimum estimated ROI

Require minimum Flip Score

Use toggles and sliders where appropriate.

7. WALLET

Create a simple crypto payment interface without making the product look like a crypto exchange.

Header:

Wallet

Main balance:

$1,284.42 USDC

Small text:
Solana Network

Buttons:
Deposit
Withdraw

Show wallet address in shortened form.

Transactions table:

DATE
TYPE
AMOUNT
STATUS

Examples:
Domain purchase
+$42 USDC
Completed

Deposit
+$500 USDC
Completed

Keep the wallet UI simple.

USDC should be the primary displayed currency.

Do not make SOL the main currency.

8. ANALYTICS

Create a professional analytics dashboard.

Metrics:

Average Acquisition Cost
Average Estimated Value
Average ROI
Sell Through Rate
Domains Acquired
Domains Sold

Charts:

Portfolio value
Acquisition spending
Sales
ROI by category

Use restrained charts and data visualization.

9. SETTINGS

Create standard account settings:

Profile
Security
Notifications
Wallet
Autopilot
Billing

Keep it simple.

INTERACTION DESIGN

Use subtle hover states.

Buttons should have clear hierarchy.

Primary buttons use the lime accent.

Tables should have hover rows.

Navigation should clearly indicate the current page.

Use subtle transitions, around 150–200ms.

Avoid excessive motion.

RESPONSIVENESS

Desktop is the primary target.

Also make the layout usable on tablet and mobile.

On mobile:

collapse the sidebar

use a top navigation/menu

tables can horizontally scroll

maintain readable spacing

IMPORTANT PRODUCT FEEL

The interface should make the user feel like:

"I have an AI analyst constantly searching the domain market for me."

It should NOT feel like:

"I am using a crypto bot."

The product is about domain investing. Crypto payments are infrastructure, not the visual identity.

Build the complete UI with realistic placeholder data and working navigation between the major pages.

Prioritize polish, consistency, spacing, typography and information hierarchy over adding unnecessary features.

Do not build backend functionality yet. Focus on creating a polished frontend prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/38a61e7c-e995-46cf-acb4-385be77c4902).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
