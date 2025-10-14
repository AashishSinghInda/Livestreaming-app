import { Server } from 'socket.io'; 
import stream from '../Model/stream.js';

export const liststream = async (req, res) => {
  try {
    
    const lives = await stream.find({ isLive: true }).select('-broadcasterSocketId -__v');
    
    const formattedLives = lives.map(l => ({
      ...l._doc,
      id: l._id, 
    }));
    res.json({
      status: 1,
      lives: formattedLives,
    });
    console.log(`Fetched ${formattedLives.length} active lives`);
  } catch (error) {
    console.error('Error in liststream:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to fetch active lives',
      lives: [],
    });
  }
};

export const streams = async (req, res) => {
  try {
    const { title, desc, broadcasterSocketId } = req.body;
    if (!title) {
      return res.status(400).json({ status: 0, message: 'Title is required' });
    }
    const newStream = new stream({
      title,
      desc: desc || '',
      broadcasterSocketId: broadcasterSocketId  || null, 
      isLive: true,
      startedAt: new Date(),
    });
    await newStream.save();

    res.json({
      status: 1,
      liveId: newStream._id,
      message: 'Stream created',
    });
    console.log(`Stream created: ${newStream._id}`);
  } catch (error) {
    console.error('Error in streams:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to create stream',
    });
  }
};

export const streamsId = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStream = await stream.findByIdAndUpdate(
      id,
      { isLive: false, stoppedAt: new Date() },
      { new: true }
    );
    if (!updatedStream) {
      return res.status(404).json({ status: 0, message: 'Stream not found' });
    }
   
    res.json({
      status: 1,
      message: 'Stream stopped',
    });
    console.log(`Stream stopped: ${id}`);
  } catch (error) {
    console.error('Error in streamsId:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to stop stream',
    });
  }
};



































































































/* import { Server } from 'socket.io'; 
import stream from '../Model/stream.js';

export const liststream = async (req, res) => {
  try {
   
    const lives = await stream.find({ isLive: true }).select('-broadcasterSocketId -__v');
    
    
    const formattedLives = lives.map(l => ({
      ...l._doc,
      id: l._id,
    }));
    res.json({
      status: 1,
      lives: formattedLives,
    });
    console.log(`Fetched ${formattedLives.length} active lives`);
  } catch (error) {
    console.error('Error in liststream:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to fetch active lives',
      lives: [],
    });
  }
};



export const streams = async (req, res) => {
  try {
    const { title, desc, broadcasterSocketId } = req.body;
    if (!title) {
      return res.status(400).json({ status: 0, message: 'Title is required' });
    }
    const newStream = new stream({
      title,
      desc: desc || '',
      broadcasterSocketId: broadcasterSocketId  || null, 
      isLive: true,
      startedAt: new Date(),
    });
    await newStream.save();

    res.json({
      status: 1,
      liveId: newStream._id,
      message: 'Stream created',
    });
    console.log(`Stream created: ${newStream._id}`);
  } catch (error) {
    console.error('Error in streams:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to create stream',
    });
  }
};





export const streamsId = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStream = await stream.findByIdAndUpdate(
      id,
      { isLive: false, stoppedAt: new Date() },
      { new: true }
    );
    if (!updatedStream) {
      return res.status(404).json({ status: 0, message: 'Stream not found' });
    }
   
    res.json({
      status: 1,
      message: 'Stream stopped',
    });
    console.log(`Stream stopped: ${id}`);
  } catch (error) {
    console.error('Error in streamsId:', error);
    res.status(500).json({
      status: 0,
      message: 'Failed to stop stream',
    });
  }
};  */ 





