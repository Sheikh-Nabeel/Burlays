export const BLOGS = [
  {
    id: 1,
    title: "Burlays: The Awami Brand That's All About Local Love",
    image: "https://images.unsplash.com/photo-1593560708920-6316e4e6d454?w=500&auto=format&fit=crop&q=60",
    fallbackImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    author: "Syed Arslan",
    date: "Oct 11, 2023",
    readTime: "2 min",
    authorImage: "https://i.pravatar.cc/100?img=11",
    content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <h3>Why Burlays?</h3>
      <p>We believe in quality, affordability, and the love for local flavors. Our journey started with a simple idea: to bring the best taste to your table without breaking the bank.</p>
      <img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800" alt="Delicious Pizza" class="w-full rounded-xl my-8" />
      <p>Join us in this delicious journey and experience the taste of happiness.</p>
    `
  },
  {
    id: 2,
    title: "Burlays and Chill: The Perfect Movie Night Pairings",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    fallbackImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    author: "Sarah Khan",
    date: "Sep 25, 2023",
    readTime: "3 min",
    authorImage: "https://i.pravatar.cc/100?img=5",
    content: `
      <p>Movie nights are incomplete without the perfect snacks. At Burlays, we have curated the best combos for your binge-watching sessions.</p>
      <p>From cheesy pizzas to spicy wings, we have it all. Order now and make your movie night unforgettable.</p>
    `
  },
  {
    id: 3,
    title: "How to Host the Ultimate Pizza Party with Burlays",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=60",
    fallbackImage: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=60",
    author: "Ali Raza",
    date: "Aug 14, 2023",
    readTime: "4 min",
    authorImage: "https://i.pravatar.cc/100?img=3",
    content: `
      <p>Planning a pizza party? Look no further. Here are some tips to host the ultimate pizza party with Burlays.</p>
      <ul>
        <li>Choose a variety of flavors to cater to everyone's taste.</li>
        <li>Don't forget the sides: garlic bread, wings, and drinks.</li>
        <li>Set the mood with good music and lighting.</li>
      </ul>
    `
  }
];

export const getBlogById = (id) => {
  return BLOGS.find(b => b.id === parseInt(id));
};
