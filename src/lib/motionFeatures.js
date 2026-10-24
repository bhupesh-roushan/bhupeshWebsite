// The animation feature set for LazyMotion, in its own module so it is fetched
// as a separate chunk after first paint rather than shipped inside the entry.
// domAnimation covers everything this site uses — animate, exit, variants,
// transitions. It leaves out drag and layout animation, which nothing here has.
import { domAnimation } from "framer-motion";
export default domAnimation;
