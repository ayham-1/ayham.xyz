---
title: "Ctrl+A DEL the C++ #1: what is struct memory-alignment?"
date: 2025-12-27T19:06:43+01:00
---


As part of my participation of the UMD Racing Formula Student team, I have been
writing the embedded software for the low-voltage class of PCBs that are 
powered with STM32 MCUs. For the architecture design, we have opted to go for a 
framework-style of software that is completely written in C. One of the 
sub-projects this framework should accommodate is a testbench that is basically
just an STM32F7 discovery board with a display. Unfortunately, due to time 
constraints, the testbench UI is designed using TouchGFX which exclusively 
generates C++ code from a WYSIWYG editor.

And this is where this entry's C++ story comes from: apparently, changing the 
order of a struct's members breaks the memory alignment between C (the framework),
and the C++ side of the testbench code.

Every project that uses the framework is recommended to have a singular global 
struct which holds the entire memory usage of the PCB, and a function which 
initialises this state struct. For the aforementioned testbench, this struct is 
written in C code (a pair of .h/.c files).

This is said struct:

```c
struct umdr_pcb_state
{
    // spoofing business
    volatile struct
    {
        struct
        {
            uint8_t lvms;
            uint8_t tsms;
            uint8_t asms;
        } switches;
        struct
        {
            uint8_t is_usable;
            uint8_t brake_perc;
            uint8_t apps_perc;
        } pedals;

        struct
        {
            uint8_t mission;
            uint8_t start_actioning;
            uint8_t wants_hv_on;
        } mission_selector;
        struct
        {
            uint8_t eco;
            uint8_t pitmode;
            uint8_t antiskid;
        } feature_selector;

        uint8_t led0;
        uint8_t led1;
        uint8_t led2;
        uint8_t led3;
        uint8_t led4;
        uint8_t led5;
    } spoof;

    uint8_t usart_txBuffer[umdr_pcb_usart_buf_sz];
    uint8_t usart_rxBuffer[umdr_pcb_usart_buf_sz];
    QueueHandle_t usart_rx_cmds; // char[64]

    struct UMDR_serializer_master_switches mswitches;
    struct UMDR_serializer_pedal_sensors psensors;

    struct UMDR_power_distributor pwr_dist;

    struct UMDR_usr_event_mission_selector mselector;
    struct UMDR_usr_event_feature_selector fselector;

    struct UMDR_deserializer_leds leds;

    struct UMDR_spoofer res;
    struct UMDR_spoofer asb;
    struct UMDR_spoofer dv;
    struct UMDR_spoofer ams;
    struct UMDR_spoofer bamo;

    CAN_HandleTypeDef * hcan;

    volatile struct UMDR_CanOutputSysEntry can_out[umdr_pcb_num_sys];
    volatile struct UMDR_CanInputSysEntry can_in[umdr_pcb_num_sys];
    volatile CAN_FilterTypeDef can_in_filters[umdr_pcb_can_filters];

    struct UMDR_CanOutputSys output_sys;
    struct UMDR_CanInputSys input_sys;

    struct UMDR_car_logic clu;

    struct UMDR_display_driver_generic display_driver;
    struct UMDR_graphics_rgb565 graphics;
    struct UMDR_dashboard dashboard;
};
```

And the global variable is defined like so:
```c
extern struct umdr_pcb_state state;
```

Without going into specific design decisions, this struct uses multiple modules
of the framework on the same PCB (the testbench) which would normally be split 
into the different PCBs of the actual car.

The global struct `state` is used by the spoofing code of the different 
hardware-facing modules of the framework, which is written in C. This same 
struct is also used by the C++ code responsible for the nice TouchGFX interface 
of the testbench. This is how a GUI touch-button on the testbench can be 
registered as 'spoofed' physical button input in the framework.

It should be noted that the 'normal' precuations of using C code in C++ were 
taken; the entire C header file is wrapped with `extern "C"` guards, and all 
integer types strictly use the standard `stdint.h`, and all enums use defined 
sizes (modern C), and `bool` is not used, etc.

The real funny business happens when the `spoof` struct is moved within the 
parent `state` struct. The order of the members shown in the above code snippet
do work, but if you move the spoof struct to the bottom of the state struct the 
entire memory alignment of the access from the C++ side breaks. Because, 
well... C++?

![debugger-memory-view.png](pix/posts/ctrl-a-del-the-cpp-1/debugger-memory-view.png)

Notice how the values for the spoofed pedals being shown correctly in the 
debugger view of STM32CubeIDE...

![breakpoint-wrong-memory-read.png](pix/posts/ctrl-a-del-the-cpp-1/breakpoint-wrong-memory-read.png)

Now notice how this C++ side breakpoint shows the memory misaligned.

You have to trust me in saying that the only change between the expected 
behaviour code and this nonsense is the order of the members of the struct.

Searching up online (and asking _the_ ChatGPT), points towards a very common
problem when interfacing between C and C++: sometimes the C compilation process 
sees a different layout than the C++ process. 

If `printf` debugging is rookie-level debugging, then changing the order of 
your variable definitions and seeing what order breaks the alignment surely 
must be expert-level debugging.

After an agonizing number of recompilations with different permutations of 
ordering of the members, placing the 'dashboard' member above the spoofing struct
breaks the layout, and placing the dashboard member below the spoofing struct 
unbreaks the layout (and for some reason, the spoofing struct should not be the last
member in the struct).

For completeness sake, here is the definition of the `UMDR_dashboard` struct:

```c
struct UMDR_dashboard
{
    struct UMDR_graphics_rgb565 * graphics;

    struct
    {
        volatile struct UMDR_CanOutputSysEntry * leds_ctrl;
    } can_out;

    struct
    {
        // struct UMDR_CanInputSysEntry * buttons_broadcast;
        // struct UMDR_CanInputSysEntry * clu_broadcast;
        // struct UMDR_CanInputSysEntry * ams_broadcast;
    } can_in;

    xTaskHandle thread_dashboard_handling;
    uint32_t thread_dashboard_buffer[512];
    uint8_t thread_dashboard_handlerCtrlBlock[200];

    xTaskHandle thread_can_router;
    uint32_t thread_can_router_buffer[512];
    uint8_t thread_can_router_handlerCtrlBlock[200];

    // Screens
    enum UMDR_dashboard_active_screen active_screen;
    struct
    {
        struct UMDR_screen_bootup bootup;
    } screens;
};

```

This is a WIP module. The `xTaskHandle` is just a pointer. and the enum has a 
specified size of `uint16_t`, so it *should* work...

As debugging weird compiler behaviour is not an activity I want to spend leisure 
time on, I would be designing around this limitation of whatever part of the 
compiler this is, by just simply splitting the spoofing & state and maybe 
integrating the complete system as a module in the framework, this way it is 
pure C with C++ style getters/setters (yuck).

_How the C++ compiler looks at me after I have the wrong order 
of struct-members (I committed the sin of mixing C and C++):_


![cpp-compiler-reaction.gif](pix/posts/ctrl-a-del-the-cpp-1/cpp-compiler-reaction.gif)
