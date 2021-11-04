# framework
FILE(GLOB_RECURSE FRAMEWORK_FILES framework/*.cpp framework/*.h)
#SET(CG_FRAMEWORK CG_Framework)
add_library(CG_Framework STATIC 
    ${FRAMEWORK_FILES}
)
target_include_directories(CG_Framework PRIVATE ${LIB_INCLUDES} .)
target_link_libraries(CG_Framework PRIVATE ${LIBS})
target_compile_definitions(CG_Framework PUBLIC -D_SILENCE_EXPERIMENTAL_FILESYSTEM_DEPRECATION_WARNING)
add_library(CG_Framework::CG_Framework ALIAS CG_Framework)
# add framework to libs
SET(LIBS ${LIBS} CG_Framework::CG_Framework)


# get all assignments
FILE(GLOB children RELATIVE ${CMAKE_CURRENT_LIST_DIR} ${CMAKE_CURRENT_LIST_DIR}/*)
list(FILTER children INCLUDE REGEX "^Advanced[0-9][0-9].*$")

FOREACH(child ${children})
    IF(IS_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/${child})
        add_subdirectory(${child})
    ENDIF()
ENDFOREACH()