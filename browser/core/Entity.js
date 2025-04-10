// Creating an entity should:
    // tie it into the game's update loop
    // have access to the game's event aggregator (still need to make one)
    // by default, create a sphere collider
    // by default, enable debug wireframes for collision
    // have event handlers for:
        // collision start
        // collision stay
        // collision stop
        // collision proximity enter - these are for hash-table related events
        // collision proximity stay
        // collision proximity exit

    // ideally, the hash table isn't even something I need to think about.
    
/*
    Everything should be driven by events
*/