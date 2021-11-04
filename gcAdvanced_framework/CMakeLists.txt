cmake_minimum_required(VERSION 3.14)

set(PROG_NAME cg)
project (${PROG_NAME} LANGUAGES CXX)

#set (CMAKE_CXX_STANDARD 17)
#set (CMAKE_CXX_STANDARD_REQUIRED True)
set (CMAKE_POSITION_INDEPENDENT_CODE ON)

set_property(GLOBAL PROPERTY USE_FOLDERS ON)

set(CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake" ${CMAKE_MODULE_PATH} )

set (PROGRAM_VERSION_MAJOR 1)
set (PROGRAM_VERSION_MINOR 0)

############# Required LIBRARIES ###############

#SDL
find_package(SDL2 REQUIRED)
SET(LIB_INCLUDES ${LIB_INCLUDES} ${SDL2_INCLUDE_DIR})
SET(LIBS ${LIBS} ${SDL2_LIBRARY})

#OPENGL
find_package(OpenGL REQUIRED)
SET(LIB_INCLUDES ${LIB_INCLUDES} ${OPENGL_INCLUDE_DIRS})
SET(LIBS ${LIBS} ${OPENGL_LIBRARIES})

#GLM
find_package(GLM REQUIRED)
SET(LIB_INCLUDES ${LIB_INCLUDES} ${GLM_INCLUDE_DIRS})

#GLEW
find_package(GLEW REQUIRED)
SET(LIBS ${LIBS} GLEW::GLEW)

#png
find_package(PNG REQUIRED)
SET(LIBS ${LIBS} PNG::PNG)

############# COMPILER FLAGS ###############


if (MSVC)
    # warning level 4 and all warnings as errors
    add_compile_options(/W4)
else()
    # lots of warnings and all warnings as errors
    add_compile_options(-Wall)
endif()

if(MSVC)
	#multiprocessor compilation for visual studio
	SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MP") 
endif()

if(NOT MSVC)
	MESSAGE(STATUS "Add stdc++fs for non windows systems")
	set(LIBS ${LIBS} stdc++fs)
endif()

############# SOURCE ###############

add_subdirectory(src)
