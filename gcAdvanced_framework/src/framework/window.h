#pragma once

#include "config.h"
#include "shaderManager.h"
#include "imgui/imgui_impl_sdl_gl3.h"

class Window
{
public:
    Window(int w, int h, bool vsync = true);
    virtual ~Window();

    void startMainLoop();

    virtual void update(float dt) {}
    virtual void render() {}
    virtual void renderGui() {}
    virtual void processEvent(const SDL_Event& event) {}
protected:
    SDL_Window* sdlWindow;
    SDL_GLContext context;

    float fps = 0;
    float ups = 0;
    ImGui_SDL_Renderer imgui;
    int w;
    int h;
    ShaderManager shaderManager;
};

