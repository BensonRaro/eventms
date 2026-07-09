AI Scripts

- Sidebar
  Intergrate shadnc sidebar(/components/ui/sidebar) to /(root)/(dashboard)/layout. If user visit the home page they should see => organizer should have: overview, events, create event, settings => admin should have: admin overview, management events, manage users, make group is protected using better auth as well as pending state when the user session is loading.

- Create-edit Event page
  based on the event prisma model create an "use client" eventform component that can be imported to create-event/[id] page. For date picker use shadcn ui date picker specifically Range Picker. For input use /components/global/CustomInput.tsx
- Event image upload
  Intergrate uploadthing into my project
- Handle both event create and edit using nextjs api
- Create a reusable Event.tsx file that can be imported on the home page and other events pages.Should also have a reusable EventCard.tsx having delete(handle delete using next.js api) and edit(link to eventform page/id) buttons.
- Design Event's details page
- Design User profile page. On Top User Profile and below it user tickets with ticket download button. Downloaded ticket should be a png with ticket details and qrcode.
- Build dashboard for both organizer and admin using database data.
- Allow Admin to ban or unban an event
