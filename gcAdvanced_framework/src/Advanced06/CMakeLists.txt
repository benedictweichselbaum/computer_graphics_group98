set_property(GLOBAL PROPERTY USE_FOLDERS ON)

FILE(GLOB ASSIGNMENT_FILES  src/*.cpp src/*.h shaders/*)
get_filename_component(ASSIGNMENT_NAME ${CMAKE_CURRENT_LIST_DIR} NAME)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_LIST_DIR}")
add_definitions(-DASSIGNMENT_DIRECTORY="${CMAKE_CURRENT_LIST_DIR}")

FILE(GLOB ASSIGNMENT_FILES src/*.cpp src/*.h shaders/*)

message(STATUS "Add executable ${ASSIGNMENT_NAME}")
add_executable(${ASSIGNMENT_NAME} ${ASSIGNMENT_FILES})
source_group(TREE "${CMAKE_CURRENT_LIST_DIR}"
         FILES ${ASSIGNMENT_FILES})
target_include_directories(${ASSIGNMENT_NAME} PRIVATE ${LIB_INCLUDES} .. .)
target_link_libraries(${ASSIGNMENT_NAME} PRIVATE ${LIBS})
target_compile_definitions(${ASSIGNMENT_NAME} PUBLIC -D_SILENCE_EXPERIMENTAL_FILESYSTEM_DEPRECATION_WARNING)
target_compile_features(${ASSIGNMENT_NAME} PUBLIC cxx_std_17)
