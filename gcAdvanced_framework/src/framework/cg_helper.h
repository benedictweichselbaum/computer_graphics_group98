#pragma once

#include "framework/window.h"
#include "framework/camera.h"
#include "framework/pngLoader.h"
#include "framework/objLoader.h"

using namespace glm;



struct Mesh
{
    GLuint vao = 0, vbo = 0, ibo = 0;
    int numElements;
    GLenum drawMode;

    ~Mesh();
    void create(std::vector<VertexNT>& vertices, std::vector<int>& indices, GLenum drawMode = GL_TRIANGLES);
    void loadFromFile(const std::string& file);

    void render()
    {
        glBindVertexArray(vao);
        glDrawElements(drawMode,numElements,GL_UNSIGNED_INT,0);
    }
    void renderArray()
    {
        glBindVertexArray(vao);
        glDrawArrays(drawMode,0,numElements);
    }
};

struct Texture
{
    GLuint id = 0;
    GLenum target = GL_TEXTURE_2D;
    ~Texture();
    void create(PNG::PngImage& img);
    void loadFromFile(const std::string& file);
    void bind(int location, int uniform);
};


