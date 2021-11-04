#!/bin/bash

set -e

display_status() {
    if [[ $? != 0 ]]; then
        echo -e "\e[1;5;31mScript failed! Please investigate.\e[0m"
    else
        echo -e "\e[32mInstallation complete.\e[0m"
    fi
}
trap display_status EXIT

# get the real directory names for PWD independent execution
BASE_DIR=$(realpath $(dirname $0))
CG_LIB_DIR=$(realpath ${BASE_DIR}/deps)

# install required tools and libs
sudo apt-get -y install cmake libgl1-mesa-dev libglu1-mesa-dev libxext-dev

echo "Installing SDL2"
cd ${CG_LIB_DIR}
SDL2_DIR='SDL2-2.0.12'
unzip -o ${SDL2_DIR}.zip
cd ${SDL2_DIR}
if [ -d build ]; then
	rm -rf build
fi
mkdir -p build
cd build
cmake ..
make -j 4
sudo make install

echo "Installing GLEW"
cd ${CG_LIB_DIR}
GLEW_DIR='glew-cmake-master'
unzip -o ${GLEW_DIR}.zip
cd ${GLEW_DIR}
if [ -d build ]; then
	rm -rf build
fi
mkdir -p build
cd build
cmake ..
make -j 4
sudo make install

echo "Installing zlib"
cd ${CG_LIB_DIR}
ZLIB_DIR='zlib1211'
unzip -o ${ZLIB_DIR}.zip
cd "zlib-1.2.11"
mkdir -p build
cd build
cmake ..
make -j 4
sudo make install

echo "Installing lpng"
cd ${CG_LIB_DIR}
LPNG_DIR='libpng-1.6.37'
unzip -o ${LPNG_DIR}.zip
cd ${LPNG_DIR}
mkdir -p build
cd build
cmake ..
make -j 4
sudo make install

echo "Installing glm"
cd ${CG_LIB_DIR}
GLM_DIR='glm'
unzip -o ${GLM_DIR}*.zip
cd ${GLM_DIR}
sudo cp -r glm /usr/local/include

cd ${BASE_DIR}
# change required CMAKE version to match the locally installed CMAKE.
CMAKE_VERSION=$(cmake --version |grep version |sed -E 's/^[^0-9]*(.*$)/\1/')
sed -i -E "s/(^cmake_minimum_required\(VERSION )3\.14\)/\1${CMAKE_VERSION}\)/" CMakeLists.txt

# build the assignments
mkdir -p build
cd build
cmake ..
make -j 4
