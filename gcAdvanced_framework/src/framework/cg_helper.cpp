#include "cg_helper.h"

using std::cout;
using std::endl;

Texture::~Texture()
{
    if(id)
    {
        glDeleteTextures(1,&id);
        id = 0;
    }
}

void Texture::create(PNG::PngImage &img)
{
    glGenTextures(1, &id);
    glBindTexture(target, id);

    if(img.channels == 1)
    {
        if(img.bit_depth == 8)
            glTexImage2D(target,0,GL_R8,img.width,img.height,0,GL_RED,GL_UNSIGNED_BYTE,img.data.data());
        else if(img.bit_depth ==16)
            glTexImage2D(target,0,GL_R16,img.width,img.height,0,GL_RED,GL_UNSIGNED_SHORT,img.data.data());
    }
    else if(img.channels == 3)
        glTexImage2D(target,0,GL_RGB8,img.width,img.height,0,GL_RGB,GL_UNSIGNED_BYTE,img.data.data());
    else if(img.channels == 4)
        glTexImage2D(target,0,GL_RGBA8,img.width,img.height,0,GL_RGBA,GL_UNSIGNED_BYTE,img.data.data());

    glTexParameteri(target, GL_TEXTURE_MIN_FILTER, static_cast<GLint>(GL_LINEAR));
    glTexParameteri(target, GL_TEXTURE_MAG_FILTER, static_cast<GLint>(GL_LINEAR));
    //    glTexParameteri(target, GL_TEXTURE_WRAP_S, static_cast<GLint>(GL_REPEAT));
    //    glTexParameteri(target, GL_TEXTURE_WRAP_T,static_cast<GLint>( GL_REPEAT));

    glTexParameteri(target, GL_TEXTURE_WRAP_S, static_cast<GLint>(GL_CLAMP_TO_EDGE));
    glTexParameteri(target, GL_TEXTURE_WRAP_T,static_cast<GLint>( GL_CLAMP_TO_EDGE));

    glGenerateMipmap(target);
    glTexParameteri(target,GL_TEXTURE_MIN_FILTER,GL_LINEAR_MIPMAP_LINEAR);
}

void Texture::loadFromFile(const std::string &file)
{
    PNG::PngImage img;
    PNG::readPNG(img,file);


    create(img);
}

void Texture::bind(int location, int uniform){
    glUniform1i(uniform,location);
    glActiveTexture(GL_TEXTURE0+location);
    glBindTexture(target, id);
}



Mesh::~Mesh()
{
    glDeleteVertexArrays(1, &vao);
    glDeleteBuffers(1,&ibo);
    glDeleteBuffers(1,&vbo);
}

void Mesh::create(std::vector<VertexNT> &vertices, std::vector<int> &indices, GLenum _drawMode)
{
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(VertexNT), vertices.data(), GL_STATIC_DRAW);

    glEnableVertexAttribArray( 0 );
    glEnableVertexAttribArray( 1 );
    glEnableVertexAttribArray( 2 );

    glVertexAttribPointer(0,4, GL_FLOAT, GL_FALSE, sizeof(VertexNT), 0 );
    glVertexAttribPointer(1,4, GL_FLOAT, GL_FALSE, sizeof(VertexNT), (void*) (4 * sizeof(GLfloat)) );
    glVertexAttribPointer(2,2, GL_FLOAT, GL_FALSE, sizeof(VertexNT), (void*) (8 * sizeof(GLfloat)) );


    glGenBuffers(1, &ibo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(int), indices.data(), GL_STATIC_DRAW);

    numElements = indices.size();
    drawMode = _drawMode;
}

void Mesh::loadFromFile(const std::string &file)
{
    //load teapot
    ObjLoader2 objLoader;
    objLoader.loadFile(file);
    std::vector<int> indices;
    for(auto f : objLoader.outTriangles)
    {
        indices.emplace_back(f.v[0]);indices.emplace_back(f.v[1]);indices.emplace_back(f.v[2]);
    }
    create(objLoader.outVertices,indices,GL_TRIANGLES);
}
