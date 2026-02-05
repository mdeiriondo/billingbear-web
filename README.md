# Billingbear Park Golf Course - Web Redesign ⛳️
This project involves the comprehensive migration and redesign of the **Billingbear Park Golf Course** website. The primary objective is to transform a dated and heavy digital presence (previously built on WordPress + WooCommerce) into a high-performance platform featuring a "Heritage Modern" design and an optimised content architecture.

## 🏛 Project Vision
Billingbear Park is not merely a golf course; it is a site steeped in nearly a millennium of history (Tudor, Shakespeare, Neville). The redesign aims to:
- **Elevate the Brand:** Move away from a generic "municipal" aesthetic towards a "Club with Heritage" feel.
- **Optimise Conversion:** Streamline the purchase of the 11 gift vouchers and the booking of Tee Times.
- **Extreme Performance:** Achieve a 100/100 Lighthouse score by utilising modern static technologies.

## 🛠 Tech Stack
We have chosen a **Headless/JAMstack** approach for this development:
- **Frontend:**[Astro 5](https://astro.build/) (Island Architecture for maximum speed).
- **Styling:**[Tailwind CSS 4](https://tailwindcss.com/) (CSS-first configuration).
- **Components:** React (for islands of interactivity).
- **Backend (CMS):** Headless WordPress (via REST API) for content management.
- **E-commerce:** Migration from WooCommerce to a lightweight solution (Stripe/Square/Payment Links) for selling the 11 gift vouchers.

## 🎨 Design Concept: "Heritage Modern"
- **Colour Palette:** British Racing Green, Paper Cream, Muted Gold, and Charcoal.
- **Typography:**
	- *Playfair Display* (Serif) to evoke tradition and history.
	- *Inter* (Sans) for a clean and modern user interface.
- **Key UX Features:**
	- **Course Status Bar:** Real-time information regarding course availability (Old/New Course).
	- **Bento Grid Vouchers:** An asymmetric, visual presentation of gift experiences.
	- **Scrollytelling:** An integrated historical narrative throughout the course tour.

## 📈 Current Project Status
- [x] Strategic analysis and Master Plan proposal.
- [x] Definition of Information Architecture (CPTs and ACF).
- [x] Local environment setup (LocalWP).
- [x] Initial setup of Astro 5 + Tailwind 4 + React.
- [x] Implementation of base Layout and Design System.
- [ ] Connection to the WordPress API.
- [ ] Development of the Voucher Grid component.
- [ ] Payment gateway integration (TBD: Stripe/Square).
- [ ] Automated PDF Voucher generation system.

## 🚀 Development Instructions
1. **Install dependencies:**
	```
npm install
```
2. **Start the development server:**
	```
npm run dev
```
3. **WordPress Configuration:**
	- Ensure ACF Pro and CPT UI are installed.
	- Configure endpoints for `Courses`, `Holes`, and `Vouchers`.
*Developed with ❤️ for Billingbear Park.*